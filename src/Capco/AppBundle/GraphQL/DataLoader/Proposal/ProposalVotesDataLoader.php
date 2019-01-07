<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
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
        int $cacheTtl
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
        // TODO
        $this->invalidateAll();
    }

    public function all(array $keys)
    {
        // var_dump(count($keys));
        // foreach ($keys as $key) {
        //     var_dump($this->serializeKey($key));
        // }
        $connections = [];

        // We must group proposals by step
        $steps = array_unique(array_map(function ($key) {
            return $key['step'] ? $key['step'] : null;
        }, $keys));

        // We can now batch by step
        // Not working right now
        foreach ($steps as $step) {
                $batchProposalIds = array_map(function ($key) {
                    return $key['proposal']->getId();
                }, array_filter($keys, function($value) use ($step) {
                    return $value['step'] === $step;
                }));

                if ($step instanceof CollectStep) {
                    $repo = $this->proposalCollectVoteRepository;
                } else {
                    $repo = $this->proposalSelectionVoteRepository;
                }

                $totalCountByStep = $repo->countVotesByProposalIdsAndStep(
                    $batchProposalIds,
                    $step,
                    // TODO fixme should batch with these key
                    $keys[0]['includeUnpublished']
                );

                // var_dump($totalCountByStep);
                $connections = array_map(function ($key, $index) use ($totalCountByStep, $repo, $step) {
                    $proposal = $key['proposal'];

                    $paginator = new Paginator(function (int $offset, int $limit) use ($proposal, $repo, $key, $step) {
                        if ($offset === 0 && $limit === 0) {
                            return [];
                        }
                        
                        $field = $key['args']->offsetGet('orderBy')['field'];
                        $direction = $key['args']->offsetGet('orderBy')['direction'];
                        $includeUnpublished = $key['includeUnpublished'];

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

                    $found = array_values(array_filter($totalCountByStep, function($value) use ($proposal) {
                        return $value['id'] === $proposal->getId();
                    }));
                    $totalCount = isset($found[0]) ? $found[0]['total'] : 0;

                    return $paginator->auto($key['args'], (int) $totalCount);
                }, $keys, array_keys($keys));
        }

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

    // private function resolve(
    //     Proposal $proposal,
    //     Argument $args,
    //     bool $includeUnpublished,
    //     ?AbstractStep $step = null
    // ): Connection {
    //     $field = $args->offsetGet('orderBy')['field'];
    //     $direction = $args->offsetGet('orderBy')['direction'];

    //     if ($step) {
    //         if ($step instanceof SelectionStep) {
    //             $paginator = new Paginator(function (int $offset, int $limit) use (
    //                 $field,
    //                 $proposal,
    //                 $step,
    //                 $includeUnpublished,
    //                 $direction
    //             ) {
    //                 return $this->proposalSelectionVoteRepository
    //                     ->getByProposalAndStep(
    //                         $proposal,
    //                         $step,
    //                         $limit,
    //                         $offset,
    //                         $field,
    //                         $direction,
    //                         $includeUnpublished
    //                     )
    //                     ->getIterator()
    //                     ->getArrayCopy();
    //             });

    //             $totalCount = $this->proposalSelectionVoteRepository->countVotesByProposalAndStep(
    //                 $proposal,
    //                 $step,
    //                 $includeUnpublished
    //             );

    //             return $paginator->auto($args, $totalCount);
    //         }
    //         if ($step instanceof CollectStep) {
    //             $paginator = new Paginator(function (int $offset, int $limit) use (
    //                 $field,
    //                 $proposal,
    //                 $step,
    //                 $includeUnpublished,
    //                 $direction
    //             ) {

    //                 return $this->proposalCollectVoteRepository
    //                     ->getByProposalAndStep(
    //                         $proposal,
    //                         $step,
    //                         $limit,
    //                         $offset,
    //                         $field,
    //                         $direction,
    //                         $includeUnpublished
    //                     )
    //                     ->getIterator()
    //                     ->getArrayCopy();
    //             });

    //             $totalCount = $this->proposalCollectVoteRepository->countVotesByProposalAndStep(
    //                 $proposal,
    //                 $step,
    //                 $includeUnpublished
    //             );

    //             return $paginator->auto($args, $totalCount);
    //         }

    //         throw new \RuntimeException('Unknown step type.');
    //     }

    //     $paginator = new Paginator(function (int $offset, int $limit) {
    //         return [];
    //     });
    //     $totalCount = 0;
    //     $totalCount += $this->proposalCollectVoteRepository->countVotesByProposal(
    //         $proposal,
    //         $includeUnpublished
    //     );
    //     $totalCount += $this->proposalSelectionVoteRepository->countVotesByProposal(
    //         $proposal,
    //         $includeUnpublished
    //     );

    //     return $paginator->auto($args, $totalCount);
    // }
}
