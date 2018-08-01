<?php
namespace spec\Capco\AppBundle\Manager;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument as Arg;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Reply;
use Doctrine\Orm\EntityManager;

class ContributionManagerSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Manager\ContributionManager');
    }

    function it_can_depublish_contributions_of_a_user(
        User $user,
        OpinionVote $vote,
        Proposal $proposal,
        Opinion $opinion,
        OpinionVersion $version,
        Comment $comment,
        Argument $argument,
        Source $source,
        Reply $reply
    ) {
        $proposal->setExpired(true)->willReturn($proposal);
        $opinion->setExpired(true)->willReturn($opinion);
        $version->setExpired(true)->willReturn($version);
        $comment->setExpired(true)->willReturn($comment);
        $argument->setExpired(true)->willReturn($argument);
        $source->setExpired(true)->willReturn($source);
        $reply->setExpired(true)->willReturn($reply);

        $user
            ->getContributions()
            ->willReturn([
                $vote,
                $proposal,
                $opinion,
                $version,
                $comment,
                $argument,
                $source,
                $reply,
            ]);

        $this->depublishContributions($user)->shouldReturn(true);
    }

    function it_can_depublish_contribution_of_a_user_with_nothing(User $user)
    {
        $user->getContributions()->willReturn([]);

        $this->depublishContributions($user)->shouldReturn(false);
    }

    function it_can_republish_contributions_of_a_user(
        User $user,
        OpinionVote $vote,
        Proposal $proposal,
        Opinion $opinion,
        OpinionVersion $version,
        Comment $comment,
        Argument $argument,
        Source $source,
        Reply $reply
    ) {
        $proposal->setExpired(false)->willReturn($proposal);
        $proposal->getStep()->willReturn(null);
        $proposal->setPublishedAt(Arg::any())->shouldBeCalled();
        $opinion->setExpired(false)->willReturn($opinion);
        $opinion->getStep()->willReturn(null);
        $opinion->setPublishedAt(Arg::any())->shouldBeCalled();
        $version->setExpired(false)->willReturn($version);
        $version->getStep()->willReturn(null);
        $version->setPublishedAt(Arg::any())->shouldBeCalled();
        $comment->setExpired(false)->willReturn($comment);
        $comment->getStep()->willReturn(null);
        $comment->setPublishedAt(Arg::any())->shouldBeCalled();
        $argument->setExpired(false)->willReturn($argument);
        $argument->getStep()->willReturn(null);
        $argument->setPublishedAt(Arg::any())->shouldBeCalled();
        $source->setExpired(false)->willReturn($source);
        $source->getStep()->willReturn(null);
        $source->setPublishedAt(Arg::any())->shouldBeCalled();
        $reply->setExpired(false)->willReturn($reply);
        $reply->getStep()->willReturn(null);
        $reply->setPublishedAt(Arg::any())->shouldBeCalled();

        $user
            ->getContributions()
            ->willReturn([
                $vote,
                $proposal,
                $opinion,
                $version,
                $comment,
                $argument,
                $source,
                $reply,
            ]);

        $this->republishContributions($user)->shouldReturn(true);
    }

    function it_can_republish_contribution_of_a_user_with_nothing(User $user)
    {
        $user->getContributions()->willReturn([]);
        $this->republishContributions($user)->shouldReturn(false);
    }
}
