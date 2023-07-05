<?php

namespace spec\Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use GraphQL\Executor\Promise\Adapter\SyncPromiseAdapter;
use GraphQL\Executor\Promise\Promise;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class ProposalViewerHasVoteDataLoaderSpec extends ObjectBehavior
{
    public function let(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        GlobalIdResolver $globalIdResolver,
        GraphQLCollector $collector,
        Stopwatch $stopwatch
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
            $stopwatch,
            true
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalViewerHasVoteDataLoader::class);
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
            ->willReturn([$vote1, $vote2])
        ;

        $promise = new Promise(null, new SyncPromiseAdapter());
        $promiseFactory
            ->createAll([true, true])
            ->shouldBeCalled()
            ->willReturn($promise)
        ;

        $this->all($keys)->shouldReturn($promise);
    }
}
