<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\Locale\GraphQLLocaleResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class OrganizationUrlResolver implements QueryInterface
{
    public function __construct(
        protected RouterInterface $router,
        private readonly GraphQLLocaleResolver $localeResolver
    ) {
    }

    public function __invoke(Author $user): string
    {
        $locale = $this->localeResolver->resolve();
        $slug = $user instanceof Organization ? $user->getSlug($locale, true) : $user->getSlug();

        return $this->router->generate(
            'capco_organization_profile_show_all',
            ['slug' => $slug, '_locale' => $locale],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
