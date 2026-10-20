<?php

namespace Capco\AppBundle\GraphQL\Resolver\Page;

use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\GraphQL\Resolver\Locale\GraphQLLocaleResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class PageUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly RouterInterface $router,
        private readonly GraphQLLocaleResolver $localeResolver
    ) {
    }

    public function __invoke(Page $page): string
    {
        $locale = $this->localeResolver->resolve();

        return $this->router->generate(
            'app_page_show',
            ['slug' => $page->getSlug($locale, true), '_locale' => $locale],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
