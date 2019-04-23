<?php

namespace spec\Capco\AppBundle\GraphQL\DataLoader\Proposal;

use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Proposal;
use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use GraphQL\Executor\Promise\Adapter\SyncPromiseAdapter;
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
        GlobalIdResolver $globalIdResolver,
        GraphQLCollector $collector
    ) {
        $this->beConstructedWith(
            $promiseFactory,
            $cache,
            $logger,
            $proposalCollectVoteRepository,
            $proposalSelectionVoteRepository,
            $globalIdResolver,
            'prefix',
            60,
            false,
            $collector,
            true
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalViewerVoteDataLoader::class);
    }

    public function it_resolve(
        GlobalIdResolver $globalIdResolver,
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

        $globalIdResolver->resolve('step1', $user1)->willReturn($step);
        $proposalCollectVoteRepository
            ->getByProposalIdsAndStepAndUser(['proposal1', 'proposal2'], $step, $user1)
            ->willReturn([$vote1, $vote2]);

        $promise = new Promise(null, new SyncPromiseAdapter());
        $promiseFactory
            ->createAll([$vote2, $vote1])
            ->shouldBeCalled()
            ->willReturn($promise);

        $this->all($keys)->shouldReturn($promise);
    }
}
