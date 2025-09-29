<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class UserAdminUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly RouterInterface $router
    ) {
    }

    public function __invoke(User $user): string
    {
        return $this->router->generate(
            'admin_capco_user_user_edit',
            ['id' => $user->getId()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
