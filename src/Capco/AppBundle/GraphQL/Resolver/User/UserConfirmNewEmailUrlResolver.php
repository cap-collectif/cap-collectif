<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class UserConfirmNewEmailUrlResolver implements QueryInterface
{
    public function __construct(private readonly RouterInterface $router)
    {
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
