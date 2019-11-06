<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class UserConfirmNewEmailUrlResolver implements ResolverInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(User $user): ?string
    {
        return ($token = $user->getNewEmailConfirmationToken())
            ? $this->router->generate(
                'account_confirm_new_email',
                ['token' => $token],
                UrlGeneratorInterface::ABSOLUTE_URL
            )
            : null;
    }
}
