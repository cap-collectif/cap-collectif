<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\RouterInterface;

class UrlAdminHomeUrlResolver implements ResolverInterface
{
    protected RouterInterface $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(): string
    {
        return $this->router->generate('sonata_admin_dashboard', [], RouterInterface::ABSOLUTE_URL);
    }
}
