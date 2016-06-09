<?php

namespace spec\Capco\UserBundle\Entity;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class UserSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\UserBundle\Entity\User');
    }

    function it_can_return_contributions()
    {
      $this->setVotes([]);
      $this->setProposals([]);
      $this->setOpinions([]);
      $this->setOpinionVersions([]);
      $this->setIdeas([]);
      $this->setComments([]);
      $this->setArguments([]);
      $this->setSources([]);
      $this->setReplies([]);
      $this->getContributions()->shouldReturn([]);
    }
}
