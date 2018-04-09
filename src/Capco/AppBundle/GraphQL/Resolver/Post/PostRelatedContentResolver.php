<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;

class PostRelatedContentResolver
{
    public function __invoke(Post $post)
    {
        $results = $post->getThemes();
        $results[] = $post->getProjects();
        $results[] = $post->getThemes();

        return $results;
    }
}
