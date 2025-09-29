<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class UserDisableNotificationsUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly RouterInterface $router
    ) {
    }

    public function __invoke(User $user): string
    {
        return $this->router->generate(
            'capco_profile_notifications_disable',
            ['token' => $user->getNotificationsConfiguration()->getUnsubscribeToken()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
