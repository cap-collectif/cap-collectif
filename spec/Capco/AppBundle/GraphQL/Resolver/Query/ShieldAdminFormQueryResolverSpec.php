<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\GraphQL\Resolver\Query\ShieldAdminFormQueryResolver;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ObjectRepository;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class ShieldAdminFormQueryResolverSpec extends ObjectBehavior
{
    public function let(
        Manager $toggleManager,
        EntityManagerInterface $entityManager,
        ObjectRepository $siteParameterRepository,
        ObjectRepository $siteImageRepository,
        ObjectRepository $siteParameterTranslationRepository,
    ): void {
        $entityManager->getRepository(SiteParameter::class)->willReturn($siteParameterRepository);
        $entityManager->getRepository(SiteParameterTranslation::class)->willReturn($siteParameterTranslationRepository);
        $entityManager->getRepository(SiteImage::class)->willReturn($siteImageRepository);
        $this->beConstructedWith($toggleManager, $entityManager);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ShieldAdminFormQueryResolver::class);
    }

    public function it_should_return_informations_about_shield_mode(
        Manager $toggleManager,
        SiteParameter $siteParameter,
        SiteImage $siteImage,
        SiteParameterTranslation $siteParameterTranslation,
        SiteParameterRepository $siteParameterRepository,
        SiteImageRepository $siteImageRepository,
        ObjectRepository $siteParameterTranslationRepository,
        Media $siteImageMedia
    ): void {
        $siteParameterRepository
            ->findOneBy(['keyname' => 'shield.introduction'])
            ->willReturn($siteParameter)
        ;

        $siteParameterTranslationRepository
            ->findBy(['translatable' => $siteParameter])
            ->willReturn([$siteParameterTranslation])
        ;

        $siteParameter
            ->addTranslation(Argument::any())
            ->shouldBeCalled()
        ;

        $siteParameter
            ->getTranslations()
            ->willReturn([$siteParameterTranslation])
        ;

        $siteParameterTranslation
            ->getLocale()
            ->willReturn('fr')
        ;

        $siteParameterTranslation
            ->getValue()
            ->willReturn('Introduction text translated')
        ;

        $siteParameter
            ->getValue()
            ->willReturn('<p>Introduction text in shield mode</p>')
        ;

        $siteImageRepository
            ->findOneBy(['keyname' => 'image.shield'])
            ->willReturn($siteImage)
        ;

        $toggleManager
            ->isActive('shield_mode')
            ->willReturn(true)
        ;

        $siteImage
            ->getMedia()
            ->willReturn($siteImageMedia)
        ;

        $this->__invoke()->shouldBe([
            'shieldMode' => true,
            'introduction' => '<p>Introduction text in shield mode</p>',
            'media' => $siteImageMedia,
            'translations' => [
                [
                    'locale' => 'fr',
                    'introduction' => 'Introduction text translated',
                ],
            ],
        ]);
    }

    public function it_should_return_informations_about_shield_mode_even_if_media_does_not_exist(
        Manager $toggleManager,
        SiteParameter $siteParameter,
        SiteImage $siteImage,
        SiteParameterTranslation $siteParameterTranslation,
        SiteParameterRepository $siteParameterRepository,
        SiteImageRepository $siteImageRepository,
        ObjectRepository $siteParameterTranslationRepository
    ): void {
        $siteParameterRepository
            ->findOneBy(['keyname' => 'shield.introduction'])
            ->willReturn($siteParameter)
        ;

        $siteParameterTranslationRepository
            ->findBy(['translatable' => $siteParameter])
            ->willReturn([$siteParameterTranslation])
        ;

        $siteParameter
            ->addTranslation(Argument::any())
            ->shouldBeCalled()
        ;

        $siteParameter
            ->getTranslations()
            ->willReturn([$siteParameterTranslation])
        ;

        $siteParameterTranslation
            ->getLocale()
            ->willReturn('fr')
        ;

        $siteParameterTranslation
            ->getValue()
            ->willReturn('Introduction text translated')
        ;

        $siteParameter
            ->getValue()
            ->willReturn('<p>Introduction text in shield mode</p>')
        ;

        $siteImageRepository
            ->findOneBy(['keyname' => 'image.shield'])
            ->willReturn($siteImage)
        ;

        $toggleManager
            ->isActive('shield_mode')
            ->willReturn(true)
        ;

        $siteImage
            ->getMedia()
            ->willReturn(null)
        ;

        $this->__invoke()->shouldBe([
            'shieldMode' => true,
            'introduction' => '<p>Introduction text in shield mode</p>',
            'media' => null,
            'translations' => [
                [
                    'locale' => 'fr',
                    'introduction' => 'Introduction text translated',
                ],
            ],
        ]);
    }
}
