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

    public function it_can_be_seen_in_BO_by_admin_or_superadmin(User $viewer, Proposal $proposal): void
    {
        $viewer->isAdmin()->willReturn(true);
        $proposal->viewerCanSeeInBo($viewer)->willReturn(true);
    }

    public function it_can_be_seen_by_admin_or_superadmin(User $viewer, Proposal $proposal): void
    {
        $viewer->isAdmin()->willReturn(true);
        $proposal->viewerCanSee($viewer)->willReturn(true);
    }

    public function it_can_be_seen_by_author_if_not_published(User $viewer, Proposal $proposal): void
    {
        $viewer->isAdmin()->willReturn(false);
        $proposal->isPublished()->willReturn(false);
        $proposal->getAuthor()->willReturn($viewer);
        $proposal->viewerCanSee($viewer)->willReturn(true);
    }
}
