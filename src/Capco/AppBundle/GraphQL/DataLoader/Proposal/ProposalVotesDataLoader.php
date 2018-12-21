<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;

class ProposalVotesDataLoader extends BatchDataLoader
{
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisCache $cache,
        LoggerInterface $logger,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        string $cachePrefix,
        int $cacheTtl = RedisCache::ONE_MINUTE
    ) {
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl
        );
    }

    public function invalidate(Proposal $proposal): void
    {
        foreach ($this->getCacheKeys() as $cacheKey) {
            $decoded = $this->getDecodedKeyFromKey($cacheKey);
            if (false !== strpos($decoded, $proposal->getId())) {
                $this->cache->deleteItem($cacheKey);
                $this->clear($cacheKey);
                $this->logger->info('Invalidated cache for proposal ' . $proposal->getId());
            }
        }
    }

    public function all(array $keys)
    {
        $connections = [];

        foreach ($keys as $key) {
            $this->logger->info(
                __METHOD__ . ' called with ' . var_export($this->serializeKey($key), true)
            );

            $connections[] = $this->resolve(
                $key['proposal'],
                $key['args'],
                $key['includeUnpublished'],
                $key['step'] ?? null
            );
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    protected function serializeKey($key)
    {
        if (\is_string($key)) {
            return $key;
        }

        return [
            'proposalId' => $key['proposal']->getId(),
            'stepId' => isset($key['step']) ? $key['step']->getId() : null,
            'args' => $key['args'],
            'includeUnpublished' => $key['includeUnpublished'],
        ];
    }

    private function resolve(
        Proposal $proposal,
        Argument $args,
        bool $includeUnpublished,
        ?AbstractStep $step = null
    ) {
        $field = $args->offsetGet('orderBy')['field'];
        $direction = $args->offsetGet('orderBy')['direction'];

        if ($step) {
            if ($step instanceof SelectionStep) {
                $paginator = new Paginator(function (int $offset, int $limit) use (
                    $field,
                    $proposal,
                    $step,
                    $includeUnpublished,
                    $direction
                ) {
                    return $this->proposalSelectionVoteRepository
                        ->getByProposalAndStep(
                            $proposal,
                            $step,
                            $limit,
                            $offset,
                            $field,
                            $direction,
                            $includeUnpublished
                        )
                        ->getIterator()
                        ->getArrayCopy();
                });

                $totalCount = $this->proposalSelectionVoteRepository->countVotesByProposalAndStep(
                    $proposal,
                    $step,
                    $includeUnpublished
                );

                return $paginator->auto($args, $totalCount);
            }
            if ($step instanceof CollectStep) {
                $paginator = new Paginator(function (int $offset, int $limit) use (
                    $field,
                    $proposal,
                    $step,
                    $includeUnpublished,
                    $direction
                ) {
                    return $this->proposalCollectVoteRepository
                        ->getByProposalAndStep(
                            $proposal,
                            $step,
                            $limit,
                            $offset,
                            $field,
                            $direction,
                            $includeUnpublished
                        )
                        ->getIterator()
                        ->getArrayCopy();
                });

                $totalCount = $this->proposalCollectVoteRepository->countVotesByProposalAndStep(
                    $proposal,
                    $step,
                    $includeUnpublished
                );

                return $paginator->auto($args, $totalCount);
            }

            throw new \RuntimeException('Unknown step type.');
        }

        $paginator = new Paginator(function (int $offset, int $limit) {
            return [];
        });
        $totalCount = 0;
        $totalCount += $this->proposalCollectVoteRepository->countVotesByProposal(
            $proposal,
            $includeUnpublished
        );
        $totalCount += $this->proposalSelectionVoteRepository->countVotesByProposal(
            $proposal,
            $includeUnpublished
        );

        return $paginator->auto($args, $totalCount);
    }
}
