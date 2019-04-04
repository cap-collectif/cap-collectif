<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class PostAbstractResolver implements ResolverInterface
{
    public function __invoke(Post $post): string
    {
        return $post->getAbstractOrBeginningOfTheText();
    }
}
