<?php

namespace spec\Capco\AppBundle\Manager;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Routing\Router;
use Symfony\Component\Validator\ValidatorInterface;


class MenuItemResolverSpec extends ObjectBehavior
{

    function let(MenuItemRepository $repository, Manager $toggleManager, Router $router, ValidatorInterface $validator)
    {
        $toggleManager->all()->willReturn([]);
        $this->beConstructedWith($repository, $toggleManager, $router, $validator);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Manager\MenuItemResolver');
    }
}
