<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Entity\Interfaces\Trashable;

class ProposalSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(Proposal::class);
    }

    public function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }

    public function it_is_a_trashable()
    {
        $this->shouldImplement(Trashable::class);
    }

    public function it_is_displayable_in_bo()
    {
        $this->shouldImplement(DisplayableInBOInterface::class);
    }

    public function it_can_be_seen_by_admin_draft(User $viewer, Proposal $proposal): void
    {
        $proposal->setDraft(true);
        $viewer->setRoles(['ROLE_ADMIN']);
        $proposal->viewerCanSeeInBo($viewer)->willReturn(true);
    }

    public function it_can_be_seen_by_super_admin_draft(User $viewer, Proposal $proposal): void
    {
        $proposal->setDraft(true);
        $viewer->setRoles(['ROLE_SUPER_ADMIN']);
        $proposal->viewerCanSeeInBo($viewer)->willReturn(true);
    }
}
