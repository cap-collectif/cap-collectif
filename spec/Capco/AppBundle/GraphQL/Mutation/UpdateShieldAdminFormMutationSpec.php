<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\GraphQL\Mutation\UpdateShieldAdminFormMutation;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\MediaBundle\Entity\Media;
use Capco\MediaBundle\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;

class UpdateShieldAdminFormMutationSpec extends ObjectBehavior
{
    public function let(
        RedisCache $cache,
        SiteImageRepository $siteImageRepository,
        EntityManagerInterface $em,
        MediaRepository $mediaRepository,
        SiteParameterRepository $siteParameterRepository,
        Manager $toggleManager
    ) {
        $this->beConstructedWith(
            $cache,
            $siteImageRepository,
            $em,
            $mediaRepository,
            $siteParameterRepository,
            $toggleManager
        );
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(UpdateShieldAdminFormMutation::class);
    }

    public function it_update_shield(
        Locale $locale,
        SiteImageRepository $siteImageRepository,
        SiteImage $siteImage,
        EntityManagerInterface $em,
        MediaRepository $mediaRepository,
        Media $media,
        SiteParameterRepository $siteParameterRepository,
        LocaleRepository $localeRepository,
        Manager $toggleManager,
        SiteParameter $currentIntroductionParameter,
        Arg $arguments
    ): void {
        $argumentsValues = ['mediaId' => 'image', 'shieldMode' => true, 'introduction' => ''];
        $arguments->getArrayCopy()->willReturn($argumentsValues);

        $arguments->offsetGet('mediaId')->willReturn('image');
        $arguments->offsetGet('shieldMode')->willReturn(true);
        $arguments->offsetGet('introduction')->willReturn('');
        $shieldMode = true;
        $introduction = '';
        $siteImage->getIsEnabled()->willReturn(true);
        $siteImage
            ->getKeyname()
            ->willReturn(UpdateShieldAdminFormMutation::SHIELD_IMAGE_PARAMETER_KEY);

        $siteImageRepository
            ->findOneBy([
                'keyname' => UpdateShieldAdminFormMutation::SHIELD_IMAGE_PARAMETER_KEY,
            ])
            ->willReturn($siteImage);

        $media->getId()->willReturn($argumentsValues['mediaId']);
        $mediaRepository->find('image')->willReturn($media);
        $siteImage->setMedia($media)->shouldBeCalled();
        $siteImage->setIsEnabled(null !== $media)->shouldBeCalled();
        $siteImage->getMedia()->willReturn($media);
        $siteImage->getIsEnabled()->willReturn(true);

        $toggleManager
            ->exists(UpdateShieldAdminFormMutation::SHIELD_MODE_TOGGLE_KEY)
            ->willReturn(true);
        $toggleManager
            ->set(UpdateShieldAdminFormMutation::SHIELD_MODE_TOGGLE_KEY, $shieldMode)
            ->shouldBeCalled();
        $currentIntroductionParameter->setValue($introduction)->shouldBeCalled();
        $currentIntroductionParameter->mergeNewTranslations()->shouldBeCalled();
        $currentIntroductionParameter
            ->getKeyname()
            ->willReturn(UpdateShieldAdminFormMutation::SHIELD_INTRODUCTION_PARAMETER_KEY);

        $siteParameterRepository
            ->findOneBy([
                'keyname' => UpdateShieldAdminFormMutation::SHIELD_INTRODUCTION_PARAMETER_KEY,
            ])
            ->willReturn($currentIntroductionParameter);
        $em->flush()->shouldBeCalled();

        $em->getRepository(Locale::class)->willReturn($localeRepository);
        $localeRepository->findAll()->willReturn([$locale]);
        $locale->getCode()->willReturn('fr_FR');

        $this->__invoke($arguments)->shouldBe([
            'shieldAdminForm' => compact('media', 'introduction', 'shieldMode'),
        ]);
    }

    public function it_update_shield_image_disabled(
        SiteImageRepository $siteImageRepository,
        SiteImage $siteImage,
        EntityManagerInterface $em,
        MediaRepository $mediaRepository,
        SiteParameterRepository $siteParameterRepository,
        LocaleRepository $localeRepository,
        Manager $toggleManager,
        SiteParameter $currentIntroductionParameter,
        Locale $locale,
        Arg $arguments
    ): void {
        $argumentsValues = ['mediaId' => null, 'shieldMode' => true, 'introduction' => ''];
        $arguments->getArrayCopy()->willReturn($argumentsValues);

        $arguments->offsetGet('mediaId')->willReturn(null);
        $arguments->offsetGet('shieldMode')->willReturn(true);
        $arguments->offsetGet('introduction')->willReturn('');
        $shieldMode = true;
        $introduction = '';
        $siteImage->getIsEnabled()->willReturn(true);
        $siteImage
            ->getKeyname()
            ->willReturn(UpdateShieldAdminFormMutation::SHIELD_IMAGE_PARAMETER_KEY);

        $siteImageRepository
            ->findOneBy([
                'keyname' => UpdateShieldAdminFormMutation::SHIELD_IMAGE_PARAMETER_KEY,
            ])
            ->willReturn($siteImage);
        $media = null;
        $mediaRepository->find('image')->willReturn(null);
        $siteImage->setMedia($media)->shouldBeCalled();
        $siteImage->setIsEnabled(null !== $media)->shouldBeCalled();
        $siteImage->getMedia()->willReturn($media);
        $siteImage->getIsEnabled()->willReturn(false);

        $toggleManager
            ->exists(UpdateShieldAdminFormMutation::SHIELD_MODE_TOGGLE_KEY)
            ->willReturn(true);
        $toggleManager
            ->set(UpdateShieldAdminFormMutation::SHIELD_MODE_TOGGLE_KEY, $shieldMode)
            ->shouldBeCalled();
        $currentIntroductionParameter->setValue($introduction)->shouldBeCalled();
        $currentIntroductionParameter->mergeNewTranslations()->shouldBeCalled();
        $currentIntroductionParameter
            ->getKeyname()
            ->willReturn(UpdateShieldAdminFormMutation::SHIELD_INTRODUCTION_PARAMETER_KEY);

        $siteParameterRepository
            ->findOneBy([
                'keyname' => UpdateShieldAdminFormMutation::SHIELD_INTRODUCTION_PARAMETER_KEY,
            ])
            ->willReturn($currentIntroductionParameter);
        $em->flush()->shouldBeCalled();

        $em->getRepository(Locale::class)->willReturn($localeRepository);
        $localeRepository->findAll()->willReturn([$locale]);
        $locale->getCode()->willReturn('fr_FR');

        $this->__invoke($arguments)->shouldBe([
            'shieldAdminForm' => compact('media', 'introduction', 'shieldMode'),
        ]);
    }
}
