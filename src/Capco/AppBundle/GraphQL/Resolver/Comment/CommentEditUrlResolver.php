<?php

namespace Capco\AppBundle\GraphQL\Resolver\Comment;

use Capco\AppBundle\Entity\Comment;
use Symfony\Component\Routing\RouterInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class CommentEditUrlResolver implements ResolverInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
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
