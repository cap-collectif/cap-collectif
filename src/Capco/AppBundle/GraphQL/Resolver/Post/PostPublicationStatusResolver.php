<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class PostPublicationStatusResolver implements ResolverInterface
{
    public function __invoke(Post $post): string
    {
        if ($post->getIsPublished()) {
            return 'PUBLISHED';
        }

        return 'NOT_PUBLISHED';
    }
}
