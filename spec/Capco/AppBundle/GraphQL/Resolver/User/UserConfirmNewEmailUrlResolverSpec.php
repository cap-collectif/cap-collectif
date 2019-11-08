<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\Resolver\User\UserConfirmNewEmailUrlResolver;
use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\RouterInterface;

class UserConfirmNewEmailUrlResolverSpec extends ObjectBehavior
{
    private const FAKE_TOKEN = 'fakeToken';
    private const FAKE_URL = 'fakeUrl';

    public function let(RouterInterface $router)
    {
        $this->beConstructedWith($router);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(UserConfirmNewEmailUrlResolver::class);
    }

    public function it_should_return_url_for_new_mail_confirmation(
        User $user,
        RouterInterface $router
    ): void {
        $router
            ->generate('account_confirm_new_email', ['token' => self::FAKE_TOKEN], 0)
            ->willReturn(self::FAKE_URL);
        $user->getNewEmailConfirmationToken()->willReturn(self::FAKE_TOKEN);

        $this->__invoke($user)->shouldReturn(self::FAKE_URL);
    }

    public function it_should_return_null_if_no_token(User $user): void
    {
        $user->getNewEmailConfirmationToken()->willReturn(null);
        $this->__invoke($user)->shouldReturn(null);
    }
}
