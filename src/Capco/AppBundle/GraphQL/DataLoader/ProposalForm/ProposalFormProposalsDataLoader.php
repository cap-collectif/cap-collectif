<?php

namespace Capco\AppBundle\GraphQL\DataLoader\ProposalForm;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Search\ProposalSearch;
use Capco\AppBundle\Repository\ProposalRepository;
use Symfony\Component\HttpFoundation\RequestStack;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class ProposalFormProposalsDataLoader extends BatchDataLoader
{
    private $proposalRepo;
    private $proposalSearch;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalRepository $proposalRepo,
        ProposalSearch $proposalSearch,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        bool $enableCache
    ) {
        $this->proposalRepo = $proposalRepo;
        $this->proposalSearch = $proposalSearch;
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug,
            $enableCache
        );
    }

    public function invalidate(ProposalForm $form): void
    {
        $this->cache->invalidateTags([$form->getId()]);
    }

    public function all(array $keys)
    {
        if ($this->debug) {
            $this->logger->info(
                __METHOD__ .
                    'called for keys : ' .
                    var_export(
                        array_map(function ($key) {
                            return $this->serializeKey($key);
                        }, $keys),
                        true
                    )
            );
        }

        $connections = [];

        foreach ($keys as $key) {
            $connections[] = $this->resolve(
                $key['form'],
                $key['args'],
                $key['viewer'] ?? null,
                $key['request']
            );
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    protected function getCacheTag($key): array
    {
        return [$key['form']->getId()];
    }

    protected function serializeKey($key): array
    {
        $proposalForm = $key['form'];
        $viewer = $key['viewer'];
        $args = $key['args'];

        $cacheKey = [
            'form' => $proposalForm->getId(),
            'args' => $args->getRawArguments(),
        ];

        if ($args->offsetExists('affiliations') || $proposalForm->getStep()->isPrivate()) {
            // we need viewer in cache key
            $cacheKey['viewerId'] = $viewer ? $viewer->getId() : null;
        }

        return $cacheKey;
    }

    private function resolve(
        ProposalForm $form,
        Arg $args,
        $viewer,
        ?RequestStack $request
    ): Connection {
        $totalCount = 0;
        $filters = [];
        $term = null;
        $isExporting = $args->offsetGet('includeUnpublished');

        if ($args->offsetExists('term')) {
            $term = $args->offsetGet('term');
        }

        $emptyConnection = ConnectionBuilder::connectionFromArray([], $args);
        $emptyConnection->totalCount = 0;
        $emptyConnection->{'fusionCount'} = 0;

        if (!$form->getStep()) {
            return $emptyConnection;
        }

        /*
         * When a collect step is private, only the author
         * or an admin can see proposals inside.
         *
         * Except when exporting .csv files, in this case
         * everything is shown, because the admin should have
         * disable public export anyway.
         */
        if (!$isExporting && $form->getStep()->isPrivate()) {
            // If viewer is not authenticated we return an empty connection
            if (!$viewer instanceof User) {
                return $emptyConnection;
            }

            // If viewer is asking for proposals of someone else we return an empty connection
            if ($args->offsetExists('author') && $viewer->getId() !== $args->offsetGet('author')) {
                if (!$viewer->isAdmin()) {
                    return $emptyConnection;
                }
                $filters['author'] = $args->offsetGet('author');
            } elseif (!$viewer->isAdmin()) {
                // When the step is private, only an author or an admin can see proposals
                $filters['author'] = $viewer->getId();
            }
        } elseif ($args->offsetExists('author')) {
            $filters['author'] = $args->offsetGet('author');
        }
        $paginator = new Paginator(function (?int $offset, ?int $limit) use (
            $form,
            $args,
            $viewer,
            $term,
            $request,
            &$totalCount,
            $filters
        ) {
            if ($args->offsetExists('district')) {
                $filters['districts'] = $args->offsetGet('district');
            }
            if ($args->offsetExists('theme')) {
                $filters['themes'] = $args->offsetGet('theme');
            }
            if ($args->offsetExists('userType')) {
                $filters['types'] = $args->offsetGet('userType');
            }
            if ($args->offsetExists('category')) {
                $filters['categories'] = $args->offsetGet('category');
            }
            if ($args->offsetExists('status')) {
                $filters['statuses'] = $args->offsetGet('status');
            }
            if ($args->offsetExists('trashedStatus')) {
                $filters['trashedStatus'] = $args->offsetGet('trashedStatus');
            }

            if ($args->offsetExists('affiliations')) {
                $affiliations = $args->offsetGet('affiliations');
                if (\in_array('EVALUER', $affiliations, true)) {
                    $direction = $args->offsetGet('orderBy')['direction'];
                    $field = $args->offsetGet('orderBy')['field'];

                    $totalCount =
                        $viewer instanceof User
                            ? $this->proposalRepo->countProposalsByFormAndEvaluer($form, $viewer)
                            : $totalCount;

                    return $this->proposalRepo
                        ->getProposalsByFormAndEvaluer(
                            $form,
                            $viewer,
                            $offset,
                            $limit,
                            $field,
                            $direction
                        )
                        ->getIterator()
                        ->getArrayCopy();
                }

                if (\in_array('OWNER', $affiliations, true)) {
                    $filters['author'] = $viewer->getId();
                }
            }

            $direction = $args->offsetGet('orderBy')['direction'];
            $field = $args->offsetGet('orderBy')['field'];

            $order = ProposalSearch::findOrderFromFieldAndDirection($field, $direction);

            $filters['proposalForm'] = $form->getId();
            $filters['collectStep'] = $form->getStep()->getId();

            if ($viewer instanceof User) {
                // sprintf with %u is here in order to avoid negative int.
                $seed = sprintf('%u', crc32($viewer->getId()));
            } elseif ($request && $request->getCurrentRequest()) {
                // sprintf with %u is here in order to avoid negative int.
                $seed = sprintf('%u', ip2long($request->getCurrentRequest()->getClientIp()));
            } else {
                $seed = random_int(0, PHP_INT_MAX);
            }

            $results = $this->proposalSearch->searchProposals(
                $offset,
                $limit,
                $order,
                $term,
                $filters,
                $seed
            );

            $totalCount = $results['count'];

            return $results['proposals'];
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->totalCount = $totalCount;

        // TODO this is too slow
        $countFusions = $this->proposalRepo->countFusionsByProposalForm($form);
        $connection->{'fusionCount'} = $countFusions;

        return $connection;
    }
}
