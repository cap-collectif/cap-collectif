<?php

namespace Capco\AppBundle\GraphQL\Resolver\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Enum\CommentPublicationStatus;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class CommentPublicationStatusResolver implements ResolverInterface
{
    public function __invoke(Comment $comment): string
    {
        if ($comment->isTrashed()) {
            if (Trashable::STATUS_VISIBLE === $comment->getTrashedStatus()) {
                return CommentPublicationStatus::TRASHED;
            }

            return CommentPublicationStatus::TRASHED_NOT_VISIBLE;
        }

        if (!$comment->isPublished()) {
            return CommentPublicationStatus::UNPUBLISHED;
        }

        return CommentPublicationStatus::PUBLISHED;
    }
}
