<?php

namespace Capco\AppBundle\GraphQL\Resolver\Publishable;

use Capco\AppBundle\Entity\NotPublishedReason;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Model\Publishable;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class PublishableNotPublishedReasonResolver implements ResolverInterface
{
    public function __invoke(Publishable $publishable): ?string
    {
        if (
            $publishable->isPublished() ||
            ($publishable instanceof Proposal && $publishable->isDraft())
        ) {
            return null;
        }
        $author = $publishable->getAuthor();
        if (!$author) {
            return null;
        }
        if ($author->isEmailConfirmed()) {
            return NotPublishedReason::ACCOUNT_CONFIRMED_TOO_LATE;
        }
        $step = $publishable->getStep();
        if (!$step || $step->isOpen()) {
            return NotPublishedReason::WAITING_AUTHOR_CONFIRMATION;
        }

        return NotPublishedReason::AUTHOR_NOT_CONFIRMED;
    }
}
