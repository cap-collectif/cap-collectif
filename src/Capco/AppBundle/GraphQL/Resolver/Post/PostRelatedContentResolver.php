<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;

class PostRelatedContentResolver
{
    public function __invoke(Post $post): iterable
    {
        return array_merge(
            $post->getThemes()->toArray(),
            $post->getProposals()->toArray(),
            $post->getProjects()->toArray()
        );
    }
}
