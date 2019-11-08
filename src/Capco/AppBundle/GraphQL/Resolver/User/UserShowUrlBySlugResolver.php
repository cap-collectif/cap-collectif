<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class UserShowUrlBySlugResolver implements ResolverInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(string $slug): string
    {
        return $this->router->generate(
            'capco_user_profile_show_all',
            compact('slug'),
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
