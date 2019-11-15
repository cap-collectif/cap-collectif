<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\Resolver\User\UserShowUrlBySlugResolver;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Routing\RouterInterface;

class UserShowUrlBySlugResolverSpec extends ObjectBehavior
{
    private const FAKE_URL = 'fakeUrl';
    private const FAKE_SLUG = 'fakeSlug';

    public function let(RouterInterface $router)
    {
        $this->beConstructedWith($router);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(UserShowUrlBySlugResolver::class);
    }

    public function it_should_return_url_to_show_all_profile(RouterInterface $router): void {
        $router
            ->generate('capco_user_profile_show_all', ['slug' => 'fakeSlug'], 0)
            ->willReturn(self::FAKE_URL);

        $this->__invoke(self::FAKE_SLUG)->shouldReturn(self::FAKE_URL);
    }
}
