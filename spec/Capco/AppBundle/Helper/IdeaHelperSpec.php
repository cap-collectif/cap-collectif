<?php

namespace spec\Capco\AppBundle\Helper;

use PhpSpec\ObjectBehavior;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Entity\Idea;
use Capco\UserBundle\Entity\User;

class IdeaHelperSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Helper\IdeaHelper');
    }

    function it_can_find_user_vote(Idea $idea, User $user)
    {
        $idea->getVotes()->willReturn(new ArrayCollection());
        $this->findUserVoteOrCreate($idea, $user)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\IdeaVote');
    }
}
