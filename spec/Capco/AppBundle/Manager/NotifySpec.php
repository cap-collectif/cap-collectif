<?php

namespace spec\Capco\AppBundle\Manager;

use Capco\AppBundle\Resolver\UrlResolver;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Routing\Router;
use Symfony\Component\Templating\EngineInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class NotifySpec extends ObjectBehavior
{
    function let(\Swift_Mailer $mailer, EngineInterface $templating, TranslatorInterface $translator, Resolver $resolver, Router $router, UrlResolver $urlResolver, ValidatorInterface $validator)
    {
        $this->beConstructedWith($mailer, $templating, $translator, $resolver, $router, $urlResolver, $validator, ['confirmation.template' => null, 'resetting.template' => null]);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Manager\Notify');
    }
}
