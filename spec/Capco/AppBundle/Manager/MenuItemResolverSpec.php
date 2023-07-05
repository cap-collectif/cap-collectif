<?php

namespace spec\Capco\AppBundle\Manager;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Toggle\Manager;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Router;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class MenuItemResolverSpec extends ObjectBehavior
{
    public function let(
        MenuItemRepository $repository,
        Manager $toggleManager,
        Router $router,
        ValidatorInterface $validator,
        RedisCache $cache,
        RequestStack $requestStack
    ) {
        $this->beConstructedWith($repository, $toggleManager, $router, $validator, $cache, $requestStack);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Manager\MenuItemResolver');
    }
}
