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
use Capco\AppBundle\Search\ProposalSearch;

class ProposalVotesDataLoader extends BatchDataLoader
{
    public $enableBatch = true;
    public $useElasticsearch = false;

    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;
    private $proposalSearch;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalSearch $proposalSearch,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        bool $enableCache
    ) {
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
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

        if ($this->enableBatch) {
            $connections = $this->resolveBatch($keys);
        } else {
            $connections = $this->resolveWithoutBatch($keys);
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    protected function serializeKey($key): array
    {
        return [
            'proposalId' => $key['proposal']->getId(),
            // ?TODO? toGlobalId
            'stepId' => isset($key['step']) ? $key['step']->getId() : null,
            'args' => $key['args']->getRawArguments(),
            'includeUnpublished' => $key['includeUnpublished'],
        ];
    }

    private function resolveBatch($keys): array
    {
        // We must group proposals by step
        $steps = array_unique(
            array_map(function ($key) {
                return $key['step'] ?? null;
            }, $keys)
        );

        // We can now batch by step and includeUnpublished
        // Not working right now
        $step = $steps[0];
        $includeUnpublished = $keys[0]['includeUnpublished'];

        $batchProposalIds = array_map(
            function ($key) {
                return $key['proposal']->getId();
            },
            array_filter($keys, function ($value) use ($step) {
                return ($value['step'] ?? null) === $step;
            })
        );

        $esResults = [];
        if (!$includeUnpublished && $this->useElasticsearch) {
            $esResults = $this->proposalSearch->searchProposalsVotesCount($batchProposalIds);
        }

        // If no step
        if (!$step) {
            $repo = null;
            // Elasticsearch is way faster to retrieve counters
            if (!$includeUnpublished && $this->useElasticsearch) {
                $totalCountByProposal = array_map(function ($data) {
                    return ['id' => $data['id'], 'total' => $data['votesCount']];
                }, $esResults);
            }
            // Fallback to MySQL
            else {
                $totalCountByProposal = array_map(function ($proposalId) use ($includeUnpublished) {
                    $totalCount = 0;
                    $totalCount += $this->proposalCollectVoteRepository->countVotesByProposal(
                        $proposalId,
                        $includeUnpublished
                    );
                    $totalCount += $this->proposalSelectionVoteRepository->countVotesByProposal(
                        $proposalId,
                        $includeUnpublished
                    );

                    return ['id' => $proposalId, 'total' => $totalCount];
                }, $batchProposalIds);
            }
        } else {
            $repo = null;
            if ($step instanceof CollectStep) {
                $repo = $this->proposalCollectVoteRepository;
            } elseif ($step instanceof SelectionStep) {
                $repo = $this->proposalSelectionVoteRepository;
            } else {
                $this->logger->error('Please provide a Collect or Selection step');

                return $this->getPromiseAdapter()->createAll(
                    array_map(function ($key) {
                        return null;
                    }, $keys)
                );
            }

            // Elasticsearch is way faster to retrieve counters
            if (!$includeUnpublished && $this->useElasticsearch) {
                $totalCountByProposal = array_map(function ($data) use ($step) {
                    $filtered = array_values(
                        array_filter($data['votesCountByStep'], function ($value) use ($step) {
                            return $value['step']['id'] === $step->getId();
                        })
                    );

                    $totalCount = $filtered[0]['count'];

                    return ['id' => $data['id'], 'total' => $totalCount];
                }, $esResults);
            }
            // Fallback to MySQL
            else {
                $totalCountByProposal = $repo->countVotesByProposalIdsAndStep(
                    $batchProposalIds,
                    $step,
                    $includeUnpublished
                );
            }
        }

        $connections = array_map(
            function ($key, $index) use ($totalCountByProposal, $repo, $step, $includeUnpublished) {
                $proposal = $key['proposal'];

                $paginator = new Paginator(function (int $offset, int $limit) use (
                    $proposal,
                    $repo,
                    $key,
                    $step,
                    $includeUnpublished
                ) {
                    if (!$repo || (0 === $offset && 0 === $limit)) {
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
                    array_filter($totalCountByProposal, function ($value) use ($proposal) {
                        return $value['id'] === $proposal->getId();
                    })
                );
                $totalCount = isset($found[0]) ? $found[0]['total'] : 0;

                return $paginator->auto($key['args'], (int) $totalCount);
            },
            $keys,
            array_keys($keys)
        );

        return $connections;
    }

    private function resolveWithoutBatch($keys): array
    {
        $connections = [];
        foreach ($keys as $key) {
            $connections[] = $this->resolve(
                $key['proposal'],
                $key['args'],
                $key['includeUnpublished'],
                $key['step'] ?? null
            );
        }

        return $connections;
    }

    private function resolve(
        Proposal $proposal,
        Argument $args,
        bool $includeUnpublished,
        ?AbstractStep $step = null
    ): Connection {
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
