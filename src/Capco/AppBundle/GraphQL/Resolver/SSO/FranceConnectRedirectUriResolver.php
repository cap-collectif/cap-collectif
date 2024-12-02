<?php

namespace Capco\AppBundle\GraphQL\Resolver\SSO;

use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\RouterInterface;

class FranceConnectRedirectUriResolver implements QueryInterface
{
    public function __construct(private readonly RouterInterface $router)
    {
    }

    public function __invoke(): string
    {
        return $this->router->generate('franceconnect_login', [], RouterInterface::ABSOLUTE_URL);
    }
}
