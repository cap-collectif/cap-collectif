<?php

namespace spec\Capco\AppBundle\Manager;

use Capco\AppBundle\Resolver\UrlResolver;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

use Symfony\Component\Routing\Router;
use Symfony\Component\Templating\EngineInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Capco\AppBundle\SiteParameter\Resolver;


class NotifySpec extends ObjectBehavior
{

    function let(\Swift_Mailer $mailer, \Swift_Mailer $mailer2, EngineInterface $templating, TranslatorInterface $translator, Resolver $resolver, Router $router, UrlResolver $urlResolver)
    {
        $this->beConstructedWith($mailer, $mailer2, $templating, $translator, $resolver, $router, $urlResolver, ['confirmation.template' => null, 'resetting.template' => null]);
    }


    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Manager\Notify');
    }
}
