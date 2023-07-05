<?php

namespace spec\Capco\AppBundle\Twig;

use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\Twig\ReactIntlRuntime;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class ReactIntlRuntimeSpec extends ObjectBehavior
{
    public function let(
        SiteParameterResolver $resolver,
        RequestStack $requestStack
    ) {
        $this->beConstructedWith($resolver, $requestStack);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ReactIntlRuntime::class);
    }

    public function it_get_locale(
        RequestStack $requestStack,
        Request $request
    ) {
        $requestStack->getMasterRequest()->willReturn($request);
        $request->getLocale()->willReturn('fr-FR');

        $this->getLocale()->shouldReturn('fr-FR');
    }

    public function it_get_timezone(
        SiteParameterResolver $resolver
    ) {
        $resolver->getValue('global.timezone')->willReturn('America/Toronto GMT+05:00');

        $this->getTimeZone()->shouldReturn('America/Toronto');
        $resolver->getValue('global.timezone')->willReturn('Europe/Paris');

        $this->getTimeZone()->shouldReturn('Europe/Paris');
    }
}
