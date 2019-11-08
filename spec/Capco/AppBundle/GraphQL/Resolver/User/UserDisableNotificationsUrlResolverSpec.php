<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\AppBundle\GraphQL\Resolver\User\UserDisableNotificationsUrlResolver;
use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\RouterInterface;

class UserDisableNotificationsUrlResolverSpec extends ObjectBehavior
{
    private const FAKE_URL = 'fakeUrl';
    private const FAKE_TOKEN = 'fakeToken';

    public function let(RouterInterface $router)
    {
        $this->beConstructedWith($router);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(UserDisableNotificationsUrlResolver::class);
    }

    public function it_should_return_url_to_disable_notifications(
        User $user,
        RouterInterface $router,
        UserNotificationsConfiguration $userNotificationsConfiguration
    ): void {
        $router
            ->generate('capco_profile_notifications_disable', ['token' => self::FAKE_TOKEN], 0)
            ->willReturn(self::FAKE_URL);
        $user->getNotificationsConfiguration()->willReturn($userNotificationsConfiguration);
        $userNotificationsConfiguration->getUnsubscribeToken()->willReturn(self::FAKE_TOKEN);

        $this->__invoke($user)->shouldReturn(self::FAKE_URL);
    }
}
