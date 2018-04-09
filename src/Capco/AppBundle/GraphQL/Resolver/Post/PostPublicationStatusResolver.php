<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;

class PostPublicationStatusResolver
{
    public function __invoke(Post $post): string
    {
        if ($post->getIsPublished()) {
            return 'PUBLISHED';
        }

        return 'NOT_PUBLISHED';
    }
}
