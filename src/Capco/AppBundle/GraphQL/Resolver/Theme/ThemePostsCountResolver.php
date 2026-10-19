<?php

namespace Capco\AppBundle\GraphQL\Resolver\Theme;

use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Repository\PostRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

/**
 * Counts with a query rather than through the collection, which would hydrate every related post.
 */
class ThemePostsCountResolver implements QueryInterface
{
    public function __construct(
        private readonly PostRepository $postRepository
    ) {
    }

    public function __invoke(Theme $theme): int
    {
        return $this->postRepository->countByTheme($theme);
    }
}
