<?php

namespace Capco\AppBundle\GraphQL\Resolver\SSO;

use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\RouterInterface;

class FranceConnectRedirectUriResolver implements ResolverInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(): string
    {
        return $this->router->generate('franceconnect_login', [], RouterInterface::ABSOLUTE_URL);
    }
}
