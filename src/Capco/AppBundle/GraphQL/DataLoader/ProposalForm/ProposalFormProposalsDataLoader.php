<?php

namespace Capco\AppBundle\GraphQL\DataLoader\ProposalForm;

use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Enum\ProposalAffiliations;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
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
use Capco\AppBundle\GraphQL\ConnectionBuilder;

class ProposalFormProposalsDataLoader extends BatchDataLoader
{
    public const CACHE_TIME_FUSION_COUNT = 480;

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
        GraphQLCollector $collector,
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
            $collector,
            $enableCache
        );
    }

    public function invalidate(ProposalForm $form): void
    {
        $this->cache->invalidateTags([$form->getId()]);
    }

    public function all(array $keys)
    {
        if ($this->debug && $this->enableCache) {
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
            'args' => $args->getArrayCopy()
        ];

        if (
            $args->offsetExists('affiliations') ||
            (null !== $proposalForm->getStep() && $proposalForm->getStep()->isPrivate())
        ) {
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
    ): ConnectionInterface {
        $totalCount = 0;
        $filters = [];
        list(
            $term,
            $isExporting,
            $author,
            $affiliations,
            $direction,
            $field,
            $filters['districts'],
            $filters['themes'],
            $filters['types'],
            $filters['categories'],
            $filters['statuses'],
            $filters['trashedStatus'],
            $filters['includeDraft']
        ) = [
            $args->offsetGet('term'),
            $args->offsetGet('includeUnpublished'),
            $args->offsetGet('author'),
            $args->offsetGet('affiliations'),
            $args->offsetGet('orderBy')['direction'],
            $args->offsetGet('orderBy')['field'],
            $args->offsetGet('district'),
            $args->offsetGet('theme'),
            $args->offsetGet('userType'),
            $args->offsetGet('category'),
            $args->offsetGet('status'),
            $args->offsetGet('trashedStatus'),
            $args->offsetGet('includeDraft')
        ];
        $emptyConnection = ConnectionBuilder::empty(['fusionCount' => 0]);

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
            if ($author && $viewer->getId() !== $author) {
                if (!$viewer->isAdmin()) {
                    return $emptyConnection;
                }
                $filters['author'] = $args->offsetGet('author');
            } elseif (!$viewer->isAdmin()) {
                // When the step is private, only an author or an admin can see proposals
                $filters['author'] = $viewer->getId();
            }
        } elseif ($author) {
            $filters['author'] = $author;
        }

        if ($affiliations) {
            if (\in_array(ProposalAffiliations::OWNER, $affiliations, true)) {
                $filters['author'] = $viewer->getId();
            } elseif (\in_array(ProposalAffiliations::EVALUER, $affiliations, true)) {
                $paginator = new Paginator(function (int $offset, int $limit) use (
                    $form,
                    $direction,
                    $field,
                    $viewer,
                    &$totalCount
                ) {
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
                });

                $connection = $paginator->auto($args, $totalCount);
                $connection->setTotalCount($totalCount);
                $connection->{'fusionCount'} = $this->getFusionsCount($form);

                return $connection;
            }
        }

        $order = ProposalSearch::findOrderFromFieldAndDirection($field, $direction);
        $paginator = new ElasticsearchPaginator(function (
            ?string $cursor,
            ?int $offset,
            int $limit
        ) use ($form, $order, $viewer, $term, $request, &$totalCount, $filters) {
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
                $limit,
                $term,
                $filters,
                $seed,
                $offset,
                $cursor,
                $order
            );

            $totalCount = (int) $results['count'];

            return [
                'count' => (int) $results['count'],
                'entities' => $results['proposals'],
                'cursors' => $results['cursors']
            ];
        });

        $connection = $paginator->auto(
            $args,
            $totalCount,
            'random' === $order
                ? ElasticsearchPaginator::LEGACY_PAGINATION
                : ElasticsearchPaginator::ES_PAGINATION
        );
        $connection->{'fusionCount'} = $this->getFusionsCount($form);
        if (null === $connection->getTotalCount()) {
            $connection->setTotalCount($totalCount);
        }

        return $connection;
    }

    private function getFusionsCount(ProposalForm $form): int
    {
        if (!$this->enableCache) {
            return $this->proposalRepo->countFusionsByProposalForm($form);
        }

        $cacheItem = $this->cache->getItem(
            'ProposalFormProposalsDataLoader-getFusionsCount-' . $form->getId()
        );
        if (!$cacheItem->isHit()) {
            $value = $this->proposalRepo->countFusionsByProposalForm($form);
            $cacheItem->set($value)->expiresAfter(self::CACHE_TIME_FUSION_COUNT);
            $this->cache->save($cacheItem);
        }

        return $cacheItem->get();
    }
}
