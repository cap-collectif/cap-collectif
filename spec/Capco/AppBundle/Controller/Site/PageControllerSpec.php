<?php

namespace spec\Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Controller\Site\PageController;
use Capco\AppBundle\Repository\SiteParameterRepository;
use PhpSpec\ObjectBehavior;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Contracts\Translation\TranslatorInterface;

class PageControllerSpec extends ObjectBehavior
{
    public function let(
        SiteParameterRepository $siteParameterRepository,
        TranslatorInterface $translator
    ) {
        $this->beConstructedWith($siteParameterRepository, $translator);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(PageController::class);
        $this->shouldBeAnInstanceOf(AbstractController::class);
    }
}
