<?php

namespace Capco\AppBundle\GraphQL\Resolver\Comment;

use Capco\AppBundle\Entity\Comment;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\RouterInterface;

class CommentEditUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly RouterInterface $router
    ) {
    }

    public function __invoke(Comment $comment): string
    {
        return $this->router->generate(
            'app_comment_edit',
            ['commentId' => $comment->getId()],
            true
        );
    }
}
