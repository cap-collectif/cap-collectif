<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Theme;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class PostOrderedThemesResolver implements QueryInterface
{
    /**
     * @return Theme[]
     */
    public function __invoke(Post $post): array
    {
        $themes = $post->getThemes()->toArray();

        usort($themes, function (Theme $themeA, Theme $themeB) {
            if ($themeA->getPosition() !== $themeB->getPosition()) {
                return $themeA->getPosition() <=> $themeB->getPosition();
            }

            if ($themeA->getSlug() !== $themeB->getSlug()) {
                return $themeA->getSlug() <=> $themeB->getSlug();
            }

            return $themeA->getId() <=> $themeB->getId();
        });

        return $themes;
    }
}
