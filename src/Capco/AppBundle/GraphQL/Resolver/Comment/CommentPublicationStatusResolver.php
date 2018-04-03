<?php

namespace Capco\AppBundle\GraphQL\Resolver\Comment;

use Capco\AppBundle\Entity\Comment;

class CommentPublicationStatusResolver
{
    public function __invoke(Comment $comment): string
    {
        if ($comment->isExpired()) {
            return 'EXPIRED';
        }

        if ($comment->getIsTrashed()) {
            if ($comment->getIsEnabled()) {
                return 'TRASHED';
            }

            return 'TRASHED_NOT_VISIBLE';
        }

        return 'PUBLISHED';
    }
}
