<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\Resolver\User\UserRegistrationConfirmationUrlResolver;
use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\RouterInterface;

class UserRegistrationConfirmationUrlResolverSpec extends ObjectBehavior
{
    private const FAKE_TOKEN = 'fakeToken';
    private const FAKE_URL = 'fakeUrl';

    public function let(RouterInterface $router)
    {
        $this->beConstructedWith($router);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(UserRegistrationConfirmationUrlResolver::class);
    }

    public function it_should_return_url_email_confirmation(
        User $user,
        RouterInterface $router
    ): void {
        $router
            ->generate('account_confirm_email', ['token' => self::FAKE_TOKEN], 0)
            ->willReturn(self::FAKE_URL);
        $user->getConfirmationToken()->willReturn(self::FAKE_TOKEN);

        $this->__invoke($user)->shouldReturn(self::FAKE_URL);
    }

    public function it_should_return_null_if_no_token(User $user): void
    {
        $user->getConfirmationToken()->willReturn(null);

        $this->__invoke($user)->shouldReturn(null);
    }
}
