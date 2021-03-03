<?php

namespace spec\Capco\UserBundle\Entity;

use PhpSpec\ObjectBehavior;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Entity\Opinion;

class UserSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType('Capco\UserBundle\Entity\User');
    }

    public function it_can_return_contributions(Opinion $opinion)
    {
        $this->setVotes(new ArrayCollection());
        $this->setProposals(new ArrayCollection());
        $this->setOpinions(new ArrayCollection([$opinion]));
        $this->setOpinionVersions(new ArrayCollection());
        $this->setComments(new ArrayCollection());
        $this->setArguments(new ArrayCollection());
        $this->setDebateArguments(new ArrayCollection());
        $this->setSources(new ArrayCollection());
        $this->setReplies(new ArrayCollection());
        $this->getContributions()->shouldBeArray();
        $this->getContributions()->shouldHaveCount(1);
    }
}
