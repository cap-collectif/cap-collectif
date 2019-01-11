<?php

namespace spec\Capco\AppBundle\GraphQL\Dataloader\Proposal;

use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;

class ProposalViewerVoteDataLoaderSpec extends ObjectBehavior
{
    public function let(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        AbstractStepRepository $abstractStepRepository
    ) {
        $this->beConstructedWith(
            $promiseFactory,
            $cache,
            $logger,
            $proposalCollectVoteRepository,
            $proposalSelectionVoteRepository,
            $abstractStepRepository,
            'prefix',
            60,
            false,
            true
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalViewerVoteDataLoader::class);
    }

    public function it_resolve(
        AbstractStepRepository $abstractStepRepository,
        CollectStep $step,
        Proposal $proposal1,
        Proposal $proposal2,
        User $user1,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalCollectVote $vote1,
        ProposalCollectVote $vote2,
        PromiseAdapterInterface $promiseFactory
    ) {
        $proposal1->getId()->willReturn('proposal1');
        $proposal2->getId()->willReturn('proposal2');

        $keys = [
            [
                'proposal' => $proposal1,
                'stepId' => 'step1',
                'user' => $user1,
            ],
            [
                'proposal' => $proposal2,
                'stepId' => 'step1',
                'user' => $user1,
            ],
        ];
        $vote1->getProposal()->willReturn($proposal2);
        $vote2->getProposal()->willReturn($proposal1);

        $abstractStepRepository->find('step1')->willReturn($step);
        $proposalCollectVoteRepository
            ->getByProposalIdsAndStepAndUser(['proposal1', 'proposal2'], $step, $user1)
            ->willReturn([$vote1, $vote2]);

        $promiseFactory
            ->createAll([$vote2, $vote1])
            ->shouldBeCalled()
            ->willReturn([]);
        $this->all($keys);
    }
}
