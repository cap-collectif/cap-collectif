<?php

namespace Capco\AppBundle\GraphQL\Resolver\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class CommentShowUrlResolver implements ResolverInterface
{
    private $urlResolver;

    public function __construct(UrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }

    public function __invoke(Comment $comment): string
    {
        return $this->urlResolver->getObjectUrl($comment, true);
    }
}
