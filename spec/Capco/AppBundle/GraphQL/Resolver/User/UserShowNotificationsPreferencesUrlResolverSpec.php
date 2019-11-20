<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\Resolver\User\UserShowNotificationsPreferencesUrlResolver;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Routing\RouterInterface;

class UserShowNotificationsPreferencesUrlResolverSpec extends ObjectBehavior
{
    private const FAKE_URL = 'fakeUrl';

    public function let(RouterInterface $router)
    {
        $this->beConstructedWith($router);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(UserShowNotificationsPreferencesUrlResolver::class);
    }

    public function it_should_return_url_for_notifications_preferences(
        RouterInterface $router
    ): void {
        $router
            ->generate('capco_profile_notifications_edit_account', [], 0)
            ->willReturn(self::FAKE_URL);

        $this->__invoke()->shouldReturn(self::FAKE_URL);
    }
}
