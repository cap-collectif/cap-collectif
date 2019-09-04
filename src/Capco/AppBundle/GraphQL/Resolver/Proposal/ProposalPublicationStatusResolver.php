<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Enum\ProposalPublicationStatus;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalPublicationStatusResolver implements ResolverInterface
{
    public function __invoke(Proposal $proposal): string
    {
        if ($proposal->isDraft()) {
            return ProposalPublicationStatus::DRAFT;
        }
        if ($proposal->isDeleted()) {
            return ProposalPublicationStatus::DELETED;
        }

        if ($proposal->isTrashed()) {
            if (Trashable::STATUS_VISIBLE === $proposal->getTrashedStatus()) {
                return ProposalPublicationStatus::TRASHED;
            }

            return ProposalPublicationStatus::TRASHED_NOT_VISIBLE;
        }

        if (!$proposal->isPublished()) {
            return ProposalPublicationStatus::UNPUBLISHED;
        }

        return ProposalPublicationStatus::PUBLISHED;
    }
}
