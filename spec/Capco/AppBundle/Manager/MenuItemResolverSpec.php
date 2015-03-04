<?php

namespace spec\Capco\AppBundle\Manager;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Toggle\Manager;


class MenuItemResolverSpec extends ObjectBehavior
{

    function let(MenuItemRepository $repository, Manager $toggleManager)
    {
        $toggleManager->all()->willReturn([]);
        $this->beConstructedWith($repository, $toggleManager);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Manager\MenuItemResolver');
    }
}
