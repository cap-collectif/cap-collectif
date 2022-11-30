<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Interfaces\Author;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class OrganizationUrlResolver implements ResolverInterface
{
    protected RouterInterface $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
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
