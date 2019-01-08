<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;

class ProposalVotesDataLoader extends BatchDataLoader
{
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug
    ) {
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug
        );
    }

    public function invalidate(Proposal $proposal): void
    {
        // TODO
        $this->invalidateAll();
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

        // We must group proposals by step
        $steps = array_unique(
            array_map(function ($key) {
                return $key['step'] ? $key['step'] : null;
            }, $keys)
        );

        // We can now batch by step and includeUnpublished
        // Not working right now
        $step = $keys[0]['step'];
        $includeUnpublished = $keys[0]['includeUnpublished'];

        $batchProposalIds = array_map(
            function ($key) {
                return $key['proposal']->getId();
            },
            array_filter($keys, function ($value) use ($step) {
                return $value['step'] === $step;
            })
        );

        if ($step instanceof CollectStep) {
            $repo = $this->proposalCollectVoteRepository;
        } else {
            $repo = $this->proposalSelectionVoteRepository;
        }

        $totalCountByStep = $repo->countVotesByProposalIdsAndStep(
            $batchProposalIds,
            $step,
            $includeUnpublished
        );

        $connections = array_map(
            function ($key, $index) use ($totalCountByStep, $repo, $step, $includeUnpublished) {
                $proposal = $key['proposal'];

                $paginator = new Paginator(function (int $offset, int $limit) use (
                    $proposal,
                    $repo,
                    $key,
                    $step,
                    $includeUnpublished
                ) {
                    if (0 === $offset && 0 === $limit) {
                        return [];
                    }

                    $field = $key['args']->offsetGet('orderBy')['field'];
                    $direction = $key['args']->offsetGet('orderBy')['direction'];

                    return $repo
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

                $found = array_values(
                    array_filter($totalCountByStep, function ($value) use ($proposal) {
                        return $value['id'] === $proposal->getId();
                    })
                );
                $totalCount = isset($found[0]) ? $found[0]['total'] : 0;

                return $paginator->auto($key['args'], (int) $totalCount);
            },
            $keys,
            array_keys($keys)
        );

        return $this->getPromiseAdapter()->createAll($connections);
    }

    protected function serializeKey($key): array
    {
        return [
            'proposalId' => $key['proposal']->getId(),
            'stepId' => isset($key['step']) ? $key['step']->getId() : null,
            'args' => $key['args']->getRawArguments(),
            'includeUnpublished' => $key['includeUnpublished'],
        ];
    }
}
