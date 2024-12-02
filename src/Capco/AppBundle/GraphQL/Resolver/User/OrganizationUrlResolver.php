<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Interfaces\Author;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class OrganizationUrlResolver implements QueryInterface
{
    public function __construct(protected RouterInterface $router)
    {
    }

    public function __invoke(Author $user): string
    {
        return $this->router->generate(
            'capco_organization_profile_show_all',
            ['slug' => $user->getSlug()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
