<?php

namespace Capco\AppBundle\GraphQL\Resolver\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class CommentShowUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly UrlResolver $urlResolver
    ) {
    }

    public function __invoke(Comment $comment): string
    {
        return $this->urlResolver->getObjectUrl($comment, true);
    }
}
