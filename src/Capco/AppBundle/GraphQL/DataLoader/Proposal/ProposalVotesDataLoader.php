<?php
namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Overblog\DataLoader\Option;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Cache\CacheItemPoolInterface;
use Psr\Log\LoggerInterface;

class ProposalVotesDataLoader extends BatchDataLoader
{
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        CacheItemPoolInterface $cache,
        LoggerInterface $logger,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository
    ) {
        $options = new Option([
            'cacheKeyFn' =>
                function ($key) {
                    return '-[' . base64_encode(var_export($this->serializeKey($key), true)) . ']-';
                },
        ]);
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        parent::__construct([$this, 'all'], $promiseFactory, $logger, $cache, $options);
    }

    protected function serializeKey($key): array
    {
        return [
            'proposalId' => $key['proposal']->getId(),
            'stepId' => isset($key['step']) ? $key['step']->getId() : null,
            'args' => $key['args'],
            'includeExpired' => $key['includeExpired'],
        ];
    }

    public function all(array $keys)
    {
        $connections = [];

        foreach ($keys as $key) {
            $this->logger->info(
                __METHOD__ . " called with " . var_export($this->serializeKey($key), true)
            );

            $field = $key['args']->offsetGet('orderBy')['field'];
            $direction = $key['args']->offsetGet('orderBy')['direction'];

            if (isset($key['step'])) {
                if ($key['step'] instanceof CollectStep) {
                    $paginator = new Paginator(function (int $offset, int $limit) use (
                        $key,
                        $field,
                        $direction
                    ) {
                        return $this->proposalCollectVoteRepository->getByProposalAndStep(
                            $key['proposal'],
                            $key['step'],
                            $limit,
                            $offset,
                            $field,
                            $direction,
                            $key['includeExpired']
                        )
                            ->getIterator()
                            ->getArrayCopy();
                    });

                    $totalCount = $this->proposalCollectVoteRepository->countVotesByProposalAndStep(
                        $key['proposal'],
                        $key['step'],
                        $key['includeExpired']
                    );

                    $connections[] = $paginator->auto($key['args'], $totalCount);
                } elseif ($key['step'] instanceof SelectionStep) {
                    $paginator = new Paginator(function (int $offset, int $limit) use (
                        $key,
                        $field,
                        $direction
                    ) {
                        return $this->proposalSelectionVoteRepository->getByProposalAndStep(
                            $key['proposal'],
                            $key['step'],
                            $limit,
                            $offset,
                            $field,
                            $direction,
                            $key['includeExpired']
                        )
                            ->getIterator()
                            ->getArrayCopy();
                    });

                    $totalCount = $this->proposalSelectionVoteRepository->countVotesByProposalAndStep(
                        $key['proposal'],
                        $key['step'],
                        $key['includeExpired']
                    );

                    $connections[] = $paginator->auto($key['args'], $totalCount);
                } else {
                    throw new \RuntimeException('Unknown step type.');
                }
            } else {
                $paginator = new Paginator(function (int $offset, int $limit) {
                    return [];
                });
                $totalCount = 0;
                $totalCount += $this->proposalCollectVoteRepository->countVotesByProposal(
                    $key['proposal'],
                    $key['includeExpired']
                );
                $totalCount += $this->proposalSelectionVoteRepository->countVotesByProposal(
                    $key['proposal'],
                    $key['includeExpired']
                );
                $connections[] = $paginator->auto($key['args'], $totalCount);
            }
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }
}
