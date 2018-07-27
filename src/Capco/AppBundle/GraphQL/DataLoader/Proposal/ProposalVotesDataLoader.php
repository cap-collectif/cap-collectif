<?php
namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Overblog\DataLoader\Option;
use Overblog\GraphQLBundle\Definition\Argument;
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
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        parent::__construct([$this, 'all'], $promiseFactory, $logger, $cache);
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

    private function resolve(
        Proposal $proposal,
        Argument $args,
        bool $includeExpired,
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
                    $includeExpired,
                    $direction
                ) {
                    return $this->proposalSelectionVoteRepository->getByProposalAndStep(
                        $proposal,
                        $step,
                        $limit,
                        $offset,
                        $field,
                        $direction,
                        $includeExpired
                    )
                        ->getIterator()
                        ->getArrayCopy();
                });

                $totalCount = $this->proposalSelectionVoteRepository->countVotesByProposalAndStep(
                    $proposal,
                    $step,
                    $includeExpired
                );

                return $paginator->auto($args, $totalCount);
            }
            if ($step instanceof CollectStep) {
                $paginator = new Paginator(function (int $offset, int $limit) use (
                    $field,
                    $proposal,
                    $step,
                    $includeExpired,
                    $direction
                ) {
                    return $this->proposalCollectVoteRepository->getByProposalAndStep(
                        $proposal,
                        $step,
                        $limit,
                        $offset,
                        $field,
                        $direction,
                        $includeExpired
                    )
                        ->getIterator()
                        ->getArrayCopy();
                });

                $totalCount = $this->proposalCollectVoteRepository->countVotesByProposalAndStep(
                    $proposal,
                    $step,
                    $includeExpired
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
            $includeExpired
        );
        $totalCount += $this->proposalSelectionVoteRepository->countVotesByProposal(
            $proposal,
            $includeExpired
        );
        return $paginator->auto($args, $totalCount);
    }

    public function all(array $keys)
    {
        $connections = [];

        foreach ($keys as $key) {
            $this->logger->info(
                __METHOD__ . " called with " . var_export($this->serializeKey($key), true)
            );

            $connections[] = $this->resolve(
                $key['proposal'],
                $key['args'],
                $key['includeExpired'],
                $key['step'] ?? null
            );
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }
}
