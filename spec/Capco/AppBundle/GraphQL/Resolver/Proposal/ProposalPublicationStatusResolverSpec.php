<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ProposalPublicationStatus;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalPublicationStatusResolver;
use PhpSpec\ObjectBehavior;

class ProposalPublicationStatusResolverSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ProposalPublicationStatusResolver::class);
    }

    public function it_handle_deleted_proposal(Proposal $proposal): void
    {
        $proposal->isArchived()->willReturn(false);
        $proposal->isDeleted()->willReturn(true);
        $this->__invoke($proposal)->shouldBe(ProposalPublicationStatus::DELETED);
    }

    public function it_handle_draft_proposal(Proposal $proposal): void
    {
        $proposal->isArchived()->willReturn(false);
        $proposal->isDeleted()->willReturn(false);
        $proposal->isDraft()->willReturn(true);
        $this->__invoke($proposal)->shouldBe(ProposalPublicationStatus::DRAFT);
    }

    public function it_handle_trashed_visible_proposal(Proposal $proposal): void
    {
        $proposal->isArchived()->willReturn(false);
        $proposal->isDeleted()->willReturn(false);
        $proposal->isDraft()->willReturn(false);
        $proposal->isTrashed()->willReturn(true);
        $proposal->getTrashedStatus()->willReturn(Trashable::STATUS_VISIBLE);
        $this->__invoke($proposal)->shouldBe(ProposalPublicationStatus::TRASHED);
    }

    public function it_handle_trashed_invisible_proposal(Proposal $proposal): void
    {
        $proposal->isArchived()->willReturn(false);
        $proposal->isDeleted()->willReturn(false);
        $proposal->isDraft()->willReturn(false);
        $proposal->isTrashed()->willReturn(true);
        $proposal->getTrashedStatus()->willReturn(Trashable::STATUS_INVISIBLE);
        $this->__invoke($proposal)->shouldBe(ProposalPublicationStatus::TRASHED_NOT_VISIBLE);
    }

    public function it_handle_unpublished_proposal(Proposal $proposal): void
    {
        $proposal->isArchived()->willReturn(false);
        $proposal->isDeleted()->willReturn(false);
        $proposal->isDraft()->willReturn(false);
        $proposal->isTrashed()->willReturn(false);
        $proposal->isPublished()->willReturn(false);
        $this->__invoke($proposal)->shouldBe(ProposalPublicationStatus::UNPUBLISHED);
    }

    public function it_handle_published_proposal(Proposal $proposal): void
    {
        $proposal->isArchived()->willReturn(false);
        $proposal->isDeleted()->willReturn(false);
        $proposal->isDraft()->willReturn(false);
        $proposal->isTrashed()->willReturn(false);
        $proposal->isPublished()->willReturn(true);
        $this->__invoke($proposal)->shouldBe(ProposalPublicationStatus::PUBLISHED);
    }
}
