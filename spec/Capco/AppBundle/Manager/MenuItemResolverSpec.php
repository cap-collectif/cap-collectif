<?php

namespace spec\Capco\AppBundle\Manager;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Manager\MenuItemResolver;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Service\MenuItemUrlGenerator;
use Capco\AppBundle\Toggle\Manager;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\RequestStack;

class MenuItemResolverSpec extends ObjectBehavior
{
    public function let(
        MenuItemRepository $repository,
        Manager $toggleManager,
        MenuItemUrlGenerator $urlGenerator,
        RedisCache $cache,
        RequestStack $requestStack
    ) {
        $this->beConstructedWith($repository, $toggleManager, $urlGenerator, $cache, $requestStack);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(MenuItemResolver::class);
    }
}
