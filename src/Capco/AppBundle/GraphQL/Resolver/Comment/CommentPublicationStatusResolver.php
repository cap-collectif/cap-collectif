<?php

namespace Capco\AppBundle\GraphQL\Resolver\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class CommentPublicationStatusResolver implements ResolverInterface
{
    public function __invoke(Comment $comment): string
    {
        if ($comment->isTrashed()) {
            if (Trashable::STATUS_VISIBLE === $comment->getTrashedStatus()) {
                return 'TRASHED';
            }

            return 'TRASHED_NOT_VISIBLE';
        }

        if (!$comment->isPublished()) {
            return 'UNPUBLISHED';
        }

        return 'PUBLISHED';
    }
}
