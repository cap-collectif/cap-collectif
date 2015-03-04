<?php

namespace spec\Capco\AppBundle\Manager;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

use Doctrine\ORM\EntityManager;
use Symfony\Component\Routing\Router;

class CommentResolverSpec extends ObjectBehavior
{
    function let(EntityManager $em, Router $router)
    {
        $this->beConstructedWith($em, $router);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Manager\CommentResolver');
    }
}
