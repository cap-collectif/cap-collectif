<?php

namespace Capco\AppBundle\GraphQL\Resolver\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Resolver\UrlResolver;

class CommentShowUrlResolver
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
