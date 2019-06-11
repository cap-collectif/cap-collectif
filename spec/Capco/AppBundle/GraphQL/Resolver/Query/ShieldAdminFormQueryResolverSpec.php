<?php

namespace spec\Capco\AppBundle\GraphQL\Query;

use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\MediaBundle\Entity\Media;
use PhpSpec\ObjectBehavior;

class ShieldAdminFormQueryResolverSpec extends ObjectBehavior
{
    public function let(
        Manager $toggleManager,
        SiteParameterRepository $siteParameterRepository,
        SiteImageRepository $siteImageRepository
    ) {
        $this->beConstructedWith($toggleManager, $siteParameterRepository, $siteImageRepository);
    }

    public function it should return informations about shield mode(
        Manager $toggleManager,
        SiteImageRepository $siteImageRepository,
        SiteParameterRepository $siteParameterRepository,
        SiteParameter $siteParameter,
        SiteImage $siteImage,
        Media $media
    ) {
        $siteParameter->getValue()->willReturn('<p>Introduction text in shield mode</p>');
        $siteImage->getMedia()->willReturn($media);

        $siteParameterRepository
            ->findOneBy(['keyname' => 'shield.introduction'])
            ->willReturn($siteParameter);
        $siteImageRepository->findOneBy(['keyname' => 'image.shield'])->willReturn($siteImage);

        $toggleManager->isActive('shield_mode')->willReturn(true);

        $this->_invoke()->shouldReturn([
            'shieldMode' => true,
            'introduction' => '<p>Introduction text in shield mode</p>',
            'media' => $media,
        ]);
    }

    public function it should return informations about shield mode even if media does not exist(
        Manager $toggleManager,
        SiteImageRepository $siteImageRepository,
        SiteParameterRepository $siteParameterRepository,
        SiteParameter $siteParameter,
        SiteImage $siteImage
    ) {
        $siteParameter->getValue()->willReturn('<p>Introduction text in shield mode</p>');
        $siteImage->getMedia()->willReturn(null);

        $siteParameterRepository
            ->findOneBy(['keyname' => 'shield.introduction'])
            ->willReturn($siteParameter);
        $siteImageRepository->findOneBy(['keyname' => 'image.shield'])->willReturn($siteImage);

        $toggleManager->isActive('shield_mode')->willReturn(true);

        $this->_invoke()->shouldReturn([
            'shieldMode' => true,
            'introduction' => '<p>Introduction text in shield mode</p>',
            'media' => null,
        ]);
    }
}
