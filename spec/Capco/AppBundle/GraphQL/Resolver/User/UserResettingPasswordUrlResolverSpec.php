<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\Resolver\User\UserResettingPasswordUrlResolver;
use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\RouterInterface;

class UserResettingPasswordUrlResolverSpec extends ObjectBehavior
{
    private const FAKE_TOKEN = 'fakeToken';
    private const FAKE_URL = 'fakeUrl';

    public function let(RouterInterface $router)
    {
        $this->beConstructedWith($router);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(UserResettingPasswordUrlResolver::class);
    }

    public function it_should_return_url_for_password_reset(
        User $user,
        RouterInterface $router
    ): void {
        $router
            ->generate('fos_user_resetting_reset', ['token' => self::FAKE_TOKEN], 0)
            ->willReturn(self::FAKE_URL);
        $user->getResetPasswordToken()->willReturn(self::FAKE_TOKEN);

        $this->__invoke($user)->shouldReturn(self::FAKE_URL);
    }
}
