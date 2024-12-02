<?php

namespace Capco\AppBundle\GraphQL\Resolver\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class CommentBodyResolver implements QueryInterface
{
    public function __construct(private readonly TranslatorInterface $translator)
    {
    }

    public function __invoke(Comment $comment): string
    {
        if ($comment->isTrashed() && Trashable::STATUS_INVISIBLE === $comment->getTrashedStatus()) {
            return $this->translator->trans('hidden-content', [], 'CapcoAppBundle');
        }

        return $comment->getBody();
    }
}
