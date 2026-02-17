<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\GraphQL\Resolver\Locale\GraphQLLocaleResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class PostOrderedThemesResolver implements QueryInterface
{
    public function __construct(private readonly GraphQLLocaleResolver $localeResolver)
    {
    }

    /**
     * @return Theme[]
     */
    public function __invoke(Post $post): array
    {
        $themes = $post->getThemes()->toArray();
        $locale = $this->localeResolver->resolve();

        usort($themes, function (Theme $themeA, Theme $themeB) use ($locale) {
            if ($themeA->getPosition() !== $themeB->getPosition()) {
                return $themeA->getPosition() <=> $themeB->getPosition();
            }

            $themeASlug = $themeA->getSlug($locale, true);
            $themeBSlug = $themeB->getSlug($locale, true);
            if ($themeASlug !== $themeBSlug) {
                return (string) $themeASlug <=> (string) $themeBSlug;
            }

            return $themeA->getId() <=> $themeB->getId();
        });

        return $themes;
    }
}
