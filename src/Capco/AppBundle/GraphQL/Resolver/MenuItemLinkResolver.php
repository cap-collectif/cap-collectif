<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\GraphQL\Resolver\Locale\GraphQLLocaleResolver;
use Capco\AppBundle\Service\MenuItemUrlGenerator;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class MenuItemLinkResolver implements QueryInterface
{
    public function __construct(
        private readonly MenuItemUrlGenerator $urlGenerator,
        private readonly GraphQLLocaleResolver $localeResolver
    ) {
    }

    public function __invoke(
        MenuItem $item,
        RequestStack $requestStack
    ): string {
        $request = $requestStack->getCurrentRequest();
        $locale = $this->localeResolver->resolveFromRequest($request);

        return $this->urlGenerator->generate($item, $locale);
    }
}
