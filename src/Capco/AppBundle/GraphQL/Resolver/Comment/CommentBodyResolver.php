<?php

namespace Capco\AppBundle\GraphQL\Resolver\Comment;

use Capco\AppBundle\Entity\Comment;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Capco\AppBundle\Entity\Interfaces\Trashable;

class CommentBodyResolver implements ResolverInterface
{
    private $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function __invoke(Comment $comment): string
    {
        if ($comment->isTrashed() && Trashable::STATUS_INVISIBLE === $comment->getTrashedStatus()) {
            return $this->translator->trans('hidden-content', [], 'CapcoAppBundle');
        }

        return $comment->getBody();
    }
}
