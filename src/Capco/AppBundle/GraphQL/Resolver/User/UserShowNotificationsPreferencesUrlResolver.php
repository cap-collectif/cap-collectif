<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class UserShowNotificationsPreferencesUrlResolver implements ResolverInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(): string
    {
        return $this->router->generate(
            'capco_profile_edit',
            ['#' => 'notifications'],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
