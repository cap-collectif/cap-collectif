<?php

namespace spec\Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\FilterCollection;
use GraphQL\Executor\Promise\Adapter\SyncPromiseAdapter;
use GraphQL\Executor\Promise\Promise;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class ProposalViewerVoteDataLoaderSpec extends ObjectBehavior
{
    public function let(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        GlobalIdResolver $globalIdResolver,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        EntityManagerInterface $em
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
            true,
            $em
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
        PromiseAdapterInterface $promiseFactory,
        FilterCollection $filters,
        EntityManagerInterface $em
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

        $em->getFilters()->willReturn($filters);
        $filters->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)
            ->shouldBeCalled()
            ->willReturn(false)
        ;

        $proposalCollectVoteRepository
            ->getByProposalIdsAndStepAndUser(['proposal1', 'proposal2'], $step, $user1)
            ->willReturn([$vote1, $vote2])
        ;

        $filters->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $promise = new Promise(null, new SyncPromiseAdapter());
        $promiseFactory
            ->createAll([$vote2, $vote1])
            ->shouldBeCalled()
            ->willReturn($promise)
        ;

        $this->all($keys)->shouldReturn($promise);
    }
}
