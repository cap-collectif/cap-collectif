<?php

namespace spec\Capco\AppBundle\Manager;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Cache\RedisCache;
use Symfony\Component\Routing\Router;
use Capco\AppBundle\Repository\MenuItemRepository;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class MenuItemResolverSpec extends ObjectBehavior
{
    public function let(
        MenuItemRepository $repository,
        Manager $toggleManager,
        Router $router,
        ValidatorInterface $validator,
        RedisCache $cache
    ) {
        $this->beConstructedWith($repository, $toggleManager, $router, $validator, $cache);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Manager\MenuItemResolver');
    }
}
