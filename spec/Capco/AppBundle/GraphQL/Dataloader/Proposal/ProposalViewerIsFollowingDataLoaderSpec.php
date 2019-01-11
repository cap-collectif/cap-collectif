<?php

namespace spec\Capco\AppBundle\GraphQL\DataLoader\Proposal;

use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Repository\FollowerRepository;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerIsFollowingDataLoader;

class ProposalViewerIsFollowingDataLoaderSpec extends ObjectBehavior
{
    public function let(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        FollowerRepository $followerRepository
    ) {
        $this->beConstructedWith(
            $promiseFactory,
            $cache,
            $logger,
            $followerRepository,
            'prefix',
            60,
            false,
            true
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalViewerIsFollowingDataLoader::class);
    }

    public function it_resolve(
        Proposal $proposal1,
        Proposal $proposal2,
        User $viewer,
        FollowerRepository $followerRepository,
        Follower $follower1,
        Follower $follower2,
        PromiseAdapterInterface $promiseFactory
    ) {
        $proposal1->getId()->willReturn('proposal1');
        $proposal2->getId()->willReturn('proposal2');
        $keys = [
            [
                'proposal' => $proposal1,
                'viewer' => $viewer,
            ],
            [
                'proposal' => $proposal2,
                'viewer' => $viewer,
            ],
        ];
        $follower1->getProposal()->willReturn($proposal1);
        $follower2->getProposal()->willReturn($proposal2);

        $followerRepository
            ->getByProposalIdsAndUser(['proposal1', 'proposal2'], $viewer)
            ->willReturn([$follower1, $follower2]);

        $promiseFactory
            ->createAll([true, true])
            ->shouldBeCalled()
            ->willReturn([]);
        $this->all($keys);
    }
}
