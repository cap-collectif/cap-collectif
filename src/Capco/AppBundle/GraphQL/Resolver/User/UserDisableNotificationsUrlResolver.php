<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class UserDisableNotificationsUrlResolver implements ResolverInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
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
