<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Enum\ReplyPublicationStatus;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ReplyPublicationStatusResolver implements ResolverInterface
{
    public function __invoke(Reply $proposal): string
    {
        if ($proposal->isDraft()) {
            return ReplyPublicationStatus::DRAFT;
        }

        if (!$proposal->isPublished()) {
            return ReplyPublicationStatus::PUBLISHED;
        }

        return ReplyPublicationStatus::PUBLISHED;
    }
}
