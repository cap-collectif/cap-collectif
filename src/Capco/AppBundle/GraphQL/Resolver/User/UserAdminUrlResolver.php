<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class UserAdminUrlResolver implements QueryInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
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
