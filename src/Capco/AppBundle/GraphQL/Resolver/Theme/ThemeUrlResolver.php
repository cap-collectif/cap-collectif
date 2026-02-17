<?php

namespace Capco\AppBundle\GraphQL\Resolver\Theme;

use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\GraphQL\Resolver\Locale\GraphQLLocaleResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ThemeUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly RouterInterface $router,
        private readonly GraphQLLocaleResolver $localeResolver
    ) {
    }

    public function __invoke(Theme $theme): string
    {
        $locale = $this->localeResolver->resolve();

        return $this->router->generate(
            'app_theme_show',
            ['slug' => $theme->getSlug($locale, true), '_locale' => $locale],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
