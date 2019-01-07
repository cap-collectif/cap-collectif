<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\UserBundle\Entity\User;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;

class ProposalViewerHasVotesDataLoader extends BatchDataLoader
{
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;
    private $abstractStepRepository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        AbstractStepRepository $abstractStepRepository,
        string $cachePrefix,
        int $cacheTtl = RedisCache::ONE_MINUTE
    ) {
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->abstractStepRepository = $abstractStepRepository;

        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl
        );
    }

    // public function invalidate(Proposal $proposal): void
    // {
    //     // TODO
    //     $this->invalidateAll();
    // }

    public function all(array $keys)
    {
        $connections = [];

        foreach ($keys as $key) {
            $connections[] = $this->resolve($key['proposal'], $key['stepId'], $key['user']);
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    protected function serializeKey($key): array
    {
        return [
            'proposalId' => $key['proposal']->getId(),
            'stepId' => $key['stepId'],
            'user' => $key['user']->getId(),
        ];
    }

    private function resolve(Proposal $proposal, string $stepId, User $user): bool
    {
        $step = $this->abstractStepRepository->find($stepId);

        if ($step instanceof CollectStep) {
            return null !==
                $this->proposalCollectVoteRepository->getByProposalAndStepAndUser(
                    $proposal,
                    $step,
                    $user
                );
        }
        if ($step instanceof SelectionStep) {
            return null !==
                $this->proposalSelectionVoteRepository->getByProposalAndStepAndUser(
                    $proposal,
                    $step,
                    $user
                );
        }

        return false;
    }
}
