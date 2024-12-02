<?php

namespace Capco\AppBundle\GraphQL\Resolver\Theme;

use Capco\AppBundle\Entity\Theme;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ThemeUrlResolver implements QueryInterface
{
    public function __construct(private readonly RouterInterface $router)
    {
    }

    public function __invoke(Theme $theme): string
    {
        return $this->router->generate(
            'app_theme_show',
            ['slug' => $theme->translate()->getSlug()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
