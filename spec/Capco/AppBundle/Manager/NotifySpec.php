<?php

namespace spec\Capco\AppBundle\Manager;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

use Symfony\Component\Routing\Router;
use Symfony\Component\Templating\EngineInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Capco\AppBundle\SiteParameter\Resolver;


class NotifySpec extends ObjectBehavior
{

    function let(\Swift_Mailer $mailer, EngineInterface $templating, TranslatorInterface $translator, Resolver $resolver, Router $router)
    {
        $this->beConstructedWith($mailer, $templating, $translator, $resolver, $router, ['confirmation.template' => null, 'resetting.template' => null]);
    }


    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Manager\Notify');
    }
}
