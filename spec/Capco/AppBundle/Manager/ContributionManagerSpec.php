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

    function it_can_publish_contributions_of_a_user(
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
        $proposal->getStep()->willReturn(null);
        $proposal->setPublishedAt(Arg::any())->shouldBeCalled();
        $opinion->getStep()->willReturn(null);
        $opinion->setPublishedAt(Arg::any())->shouldBeCalled();
        $version->getStep()->willReturn(null);
        $version->setPublishedAt(Arg::any())->shouldBeCalled();
        $comment->getStep()->willReturn(null);
        $comment->setPublishedAt(Arg::any())->shouldBeCalled();
        $argument->getStep()->willReturn(null);
        $argument->setPublishedAt(Arg::any())->shouldBeCalled();
        $source->getStep()->willReturn(null);
        $source->setPublishedAt(Arg::any())->shouldBeCalled();
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

        $this->publishContributions($user)->shouldReturn(true);
    }

    function it_can_publish_contribution_of_a_user_with_nothing(User $user)
    {
        $user->getContributions()->willReturn([]);
        $this->publishContributions($user)->shouldReturn(false);
    }
}
