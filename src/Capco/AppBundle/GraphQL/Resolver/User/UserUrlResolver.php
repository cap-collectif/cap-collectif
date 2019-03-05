<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class UserUrlResolver implements ResolverInterface
{
    protected $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(User $user): string
    {
        return $this->router->generate(
            'capco_user_profile_show_all',
            ['slug' => $user->getSlug()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
