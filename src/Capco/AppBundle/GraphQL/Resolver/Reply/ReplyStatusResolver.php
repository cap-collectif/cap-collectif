<?php
namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Enum\ReplyStatus;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ReplyStatusResolver implements ResolverInterface
{
    public function __invoke(Reply $proposal): ?string
    {
        if ($proposal->isDraft()) {
            return ReplyStatus::DRAFT;
        }

        if (!$proposal->isPublished()) {
            return ReplyStatus::PUBLISHED;
        }

        return ReplyStatus::PUBLISHED;
    }
}
