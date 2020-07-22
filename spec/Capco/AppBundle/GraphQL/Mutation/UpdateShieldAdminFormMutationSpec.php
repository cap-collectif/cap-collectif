<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\GraphQL\Mutation\UpdateShieldAdminFormMutation;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\MediaBundle\Entity\Media;
use Capco\MediaBundle\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use SAML2\Utilities\ArrayCollection;

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
        SiteImageRepository $siteImageRepository,
        SiteImage $siteImage,
        EntityManagerInterface $em,
        MediaRepository $mediaRepository,
        Media $media,
        SiteParameterRepository $siteParameterRepository,
        EntityRepository $siteParameterTranslationRepository,
        Manager $toggleManager,
        SiteParameter $currentIntroductionParameter,
        Arg $arguments
    ): void {
        $shieldMode = true;
        $introduction = '';
        $translations = [
            [
                'locale' => 'fr-FR',
                'introduction' => $introduction,
            ],
        ];
        $mediaId = 'image';

        $arguments->offsetGet('mediaId')->willReturn($mediaId);
        $arguments->offsetGet('shieldMode')->willReturn($shieldMode);
        $arguments->offsetGet('translations')->willReturn($translations);
        $siteImage->getIsEnabled()->willReturn(true);
        $siteImage
            ->getKeyname()
            ->willReturn(UpdateShieldAdminFormMutation::SHIELD_IMAGE_PARAMETER_KEY);

        $siteImageRepository
            ->findOneBy([
                'keyname' => UpdateShieldAdminFormMutation::SHIELD_IMAGE_PARAMETER_KEY,
            ])
            ->willReturn($siteImage);

        $media->getId()->willReturn($mediaId);
        $mediaRepository->find($mediaId)->willReturn($media);
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

        $oldFrenchTranslation = new SiteParameterTranslation();
        $oldFrenchTranslation->setLocale('fr-FR');
        $oldFrenchTranslation->setValue($introduction);
        $currentIntroductionParameter
            ->getTranslations()
            ->willReturn(new ArrayCollection([$oldFrenchTranslation]));
        $currentIntroductionParameter->getValue()->willReturn($introduction);
        $siteParameterRepository
            ->findOneBy([
                'keyname' => UpdateShieldAdminFormMutation::SHIELD_INTRODUCTION_PARAMETER_KEY,
            ])
            ->willReturn($currentIntroductionParameter);
        $siteParameterTranslationRepository
            ->findOneBy(['translatable' => $currentIntroductionParameter, 'locale' => 'fr-FR'])
            ->willReturn(null);
        $em
            ->getRepository(SiteParameterTranslation::class)
            ->willReturn($siteParameterTranslationRepository);

        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments)->shouldBe([
            'shieldAdminForm' => compact('media', 'shieldMode', 'introduction', 'translations'),
        ]);
    }

    public function it_update_shield_image_disabled(
        SiteImageRepository $siteImageRepository,
        SiteImage $siteImage,
        EntityManagerInterface $em,
        MediaRepository $mediaRepository,
        SiteParameterRepository $siteParameterRepository,
        EntityRepository $siteParameterTranslationRepository,
        Manager $toggleManager,
        SiteParameter $currentIntroductionParameter,
        Arg $arguments
    ): void {
        $shieldMode = true;
        $introduction = '';
        $translations = [
            [
                'locale' => 'fr-FR',
                'introduction' => $introduction,
            ],
        ];
        $mediaId = null;

        $arguments->offsetGet('mediaId')->willReturn($mediaId);
        $arguments->offsetGet('shieldMode')->willReturn($shieldMode);
        $arguments->offsetGet('translations')->willReturn($translations);
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

        $oldFrenchTranslation = new SiteParameterTranslation();
        $oldFrenchTranslation->setLocale('fr-FR');
        $oldFrenchTranslation->setValue($introduction);
        $currentIntroductionParameter->getTranslations()->willReturn([$oldFrenchTranslation]);
        $currentIntroductionParameter->getValue()->willReturn($introduction);
        $siteParameterRepository
            ->findOneBy([
                'keyname' => UpdateShieldAdminFormMutation::SHIELD_INTRODUCTION_PARAMETER_KEY,
            ])
            ->willReturn($currentIntroductionParameter);
        $siteParameterTranslationRepository
            ->findOneBy(['translatable' => $currentIntroductionParameter, 'locale' => 'fr-FR'])
            ->willReturn(null);
        $em
            ->getRepository(SiteParameterTranslation::class)
            ->willReturn($siteParameterTranslationRepository);

        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments)->shouldBe([
            'shieldAdminForm' => compact('media', 'shieldMode', 'introduction', 'translations'),
        ]);
    }

    public function it_update_introduction(
        SiteImageRepository $siteImageRepository,
        SiteImage $siteImage,
        EntityManagerInterface $em,
        MediaRepository $mediaRepository,
        Media $media,
        SiteParameterRepository $siteParameterRepository,
        EntityRepository $siteParameterTranslationRepository,
        Manager $toggleManager,
        SiteParameter $currentIntroductionParameter,
        Arg $arguments
    ): void {
        $introduction = 'oui';
        $shieldMode = true;
        $translations = [
            [
                'locale' => 'fr-FR',
                'introduction' => $introduction,
            ],
            [
                'locale' => 'en-GB',
                'introduction' => 'yes',
            ],
        ];
        $mediaId = null;

        $arguments->offsetGet('mediaId')->willReturn($mediaId);
        $arguments->offsetGet('shieldMode')->willReturn($shieldMode);
        $arguments->offsetGet('translations')->willReturn($translations);
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

        $frenchTranslation = new SiteParameterTranslation();
        $frenchTranslation->setLocale('fr-FR');
        $frenchTranslation->setValue('oui');
        $englishTranslation = new SiteParameterTranslation();
        $englishTranslation->setLocale('en-GB');
        $englishTranslation->setValue('yes');
        $currentIntroductionParameter
            ->getTranslations()
            ->willReturn(new ArrayCollection([$frenchTranslation, $englishTranslation]));
        $currentIntroductionParameter->getValue()->willReturn($introduction);
        $currentIntroductionParameter
            ->getKeyname()
            ->willReturn(UpdateShieldAdminFormMutation::SHIELD_INTRODUCTION_PARAMETER_KEY);
        $siteParameterRepository
            ->findOneBy([
                'keyname' => UpdateShieldAdminFormMutation::SHIELD_INTRODUCTION_PARAMETER_KEY,
            ])
            ->willReturn($currentIntroductionParameter);
        $siteParameterTranslationRepository
            ->findOneBy(['translatable' => $currentIntroductionParameter, 'locale' => 'fr-FR'])
            ->willReturn(null);
        $em
            ->getRepository(SiteParameterTranslation::class)
            ->willReturn($siteParameterTranslationRepository);

        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments)->shouldBe([
            'shieldAdminForm' => compact('media', 'shieldMode', 'introduction', 'translations'),
        ]);
    }
}
