<?php

namespace spec\Capco\AppBundle\Manager;

use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Reply;
use Doctrine\Orm\EntityManager;

class ContributionManagerSpec extends ObjectBehavior
{
    function let(EntityManager $em)
    {
        $this->beConstructedWith($em);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Manager\ContributionManager');
    }

    function it_can_depublish_contributions_of_a_user(EntityManager $em, User $user, OpinionVote $vote, Proposal $proposal, Opinion $opinion, OpinionVersion $version, Idea $idea, Comment $comment, Argument $argument, Source $source, Reply $reply)
    {
        $this->beConstructedWith($em);
        $proposal->setExpired(true)->willReturn($proposal);
        $opinion->setExpired(true)->willReturn($opinion);
        $version->setExpired(true)->willReturn($version);
        $idea->setExpired(true)->willReturn($idea);
        $comment->setExpired(true)->willReturn($comment);
        $argument->setExpired(true)->willReturn($argument);
        $source->setExpired(true)->willReturn($source);
        $reply->setExpired(true)->willReturn($reply);

        $user->getContributions()->willReturn([
        $vote,
        $proposal,
        $opinion,
        $version,
        $idea,
        $comment,
        $argument,
        $source,
        $reply,
      ]);

        $this->depublishContributions($user)->shouldReturn(true);
    }

    function it_can_depublish_contribution_of_a_user_with_nothing(EntityManager $em, User $user)
    {
        $this->beConstructedWith($em);
        $user->getContributions()->willReturn([]);

        $this->depublishContributions($user)->shouldReturn(false);
    }

    function it_can_republish_contributions_of_a_user(EntityManager $em, User $user, OpinionVote $vote, Proposal $proposal, Opinion $opinion, OpinionVersion $version, Idea $idea, Comment $comment, Argument $argument, Source $source, Reply $reply)
    {
        $this->beConstructedWith($em);
        $proposal->setExpired(false)->willReturn($proposal);
        $opinion->setExpired(false)->willReturn($opinion);
        $version->setExpired(false)->willReturn($version);
        $idea->setExpired(false)->willReturn($idea);
        $comment->setExpired(false)->willReturn($comment);
        $argument->setExpired(false)->willReturn($argument);
        $source->setExpired(false)->willReturn($source);
        $reply->setExpired(false)->willReturn($reply);

        $user->getContributions()->willReturn([
        $vote,
        $proposal,
        $opinion,
        $version,
        $idea,
        $comment,
        $argument,
        $source,
        $reply,
      ]);

        $this->republishContributions($user)->shouldReturn(true);
    }

    function it_can_republish_contribution_of_a_user_with_nothing(EntityManager $em, User $user)
    {
        $this->beConstructedWith($em);
        $user->getContributions()->willReturn([]);
        $this->republishContributions($user)->shouldReturn(false);
    }
}
