<?php

namespace spec\Capco\AppBundle\Manager;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Manager\ContributionManager;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument as Arg;
use Psr\Log\LoggerInterface;

class ContributionManagerSpec extends ObjectBehavior
{
    public function let(Indexer $indexer, LoggerInterface $logger)
    {
        $this->beConstructedWith($indexer, $logger);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ContributionManager::class);
    }

    public function it_can_publish_contributions_of_a_user(
        User $user,
        OpinionVote $vote,
        Proposal $proposal,
        Opinion $opinion,
        OpinionVersion $version,
        Comment $comment,
        Argument $argument,
        DebateArgument $debateArgument,
        Source $source,
        Reply $reply
    ) {
        $vote->getId()->willReturn(null);
        $vote->getStep()->willReturn(null);
        $vote->setPublishedAt(Arg::any())->shouldBeCalled()->willReturn($vote);
        $proposal->getStep()->willReturn(null);
        $proposal->getId()->willReturn('proposal1');
        $proposal->setPublishedAt(Arg::any())->shouldBeCalled()->willReturn($proposal);
        $opinion->getStep()->willReturn(null);
        $opinion->getId()->willReturn('opinion1');
        $opinion->setPublishedAt(Arg::any())->shouldBeCalled()->willReturn($opinion);
        $version->getStep()->willReturn(null);
        $version->getId()->willReturn('version1');
        $version->setPublishedAt(Arg::any())->shouldBeCalled()->willReturn($version);
        $comment->getStep()->willReturn(null);
        $comment->getId()->willReturn('opinion1');
        $comment->setPublishedAt(Arg::any())->shouldBeCalled()->willReturn($comment);
        $argument->getStep()->willReturn(null);
        $argument->getId()->willReturn('argument1');
        $argument->setPublishedAt(Arg::any())->shouldBeCalled()->willReturn($argument);
        $debateArgument->getStep()->willReturn(null);
        $debateArgument->getId()->willReturn('debateArgument1');
        $debateArgument->setPublishedAt(Arg::any())->shouldBeCalled()->willReturn($debateArgument);
        $source->getStep()->willReturn(null);
        $source->getId()->willReturn('source1');
        $source->setPublishedAt(Arg::any())->shouldBeCalled()->willReturn($source);
        $reply->getStep()->willReturn(null);
        $reply->getId()->willReturn('reply1');
        $reply->setPublishedAt(Arg::any())->shouldBeCalled()->willReturn($reply);

        $user
            ->getContributions()
            ->willReturn([
                $vote,
                $proposal,
                $opinion,
                $version,
                $comment,
                $argument,
                $debateArgument,
                $source,
                $reply,
            ])
        ;

        $this->publishContributions($user)->shouldReturn(true);
    }

    public function it_can_publish_contribution_of_a_user_with_nothing(User $user)
    {
        $user->getContributions()->willReturn([]);
        $this->publishContributions($user)->shouldReturn(false);
    }
}
