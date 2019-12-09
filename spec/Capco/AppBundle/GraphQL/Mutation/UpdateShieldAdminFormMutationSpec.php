<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\GraphQL\Mutation\UpdateShieldAdminFormMutation;
use Capco\AppBundle\GraphQL\Resolver\TimeRangeResolver;
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
        SiteImageRepository $siteImageRepository,
        EntityManagerInterface $em,
        MediaRepository $mediaRepository,
        SiteParameterRepository $siteParameterRepository,
        Manager $toggleManager
    ) {
        $this->beConstructedWith($siteImageRepository, $em, $mediaRepository, $siteParameterRepository, $toggleManager);

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
        $siteImage->getKeyname()->willReturn(UpdateShieldAdminFormMutation::SHIELD_IMAGE_PARAMETER_KEY);

        $siteImageRepository->findOneBy(
            [
                'keyname' => UpdateShieldAdminFormMutation::SHIELD_IMAGE_PARAMETER_KEY,
            ]
        )->willReturn($siteImage);

        $media->getId()->willReturn($argumentsValues['mediaId']);
        $mediaRepository->find('image')->willReturn($media);
        $siteImage->setMedia($media)->shouldBeCalled();
        $siteImage->setIsEnabled(null !== $media)->shouldBeCalled();
        $siteImage->getMedia()->willReturn($media);
        $siteImage->getIsEnabled()->willReturn(true);

        $toggleManager->exists(UpdateShieldAdminFormMutation::SHIELD_MODE_TOGGLE_KEY)->willReturn(true);
        $toggleManager->set(UpdateShieldAdminFormMutation::SHIELD_MODE_TOGGLE_KEY, $shieldMode)->shouldBeCalled();
        $currentIntroductionParameter->setValue($introduction)->shouldBeCalled();
        $currentIntroductionParameter->getKeyname()->willReturn(
            UpdateShieldAdminFormMutation::SHIELD_INTRODUCTION_PARAMETER_KEY
        );

        $siteParameterRepository->findOneBy(
            [
                'keyname' => UpdateShieldAdminFormMutation::SHIELD_INTRODUCTION_PARAMETER_KEY,
            ]
        )->willReturn($currentIntroductionParameter);
        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments)->shouldBe(['shieldAdminForm' => compact('media', 'introduction', 'shieldMode')]);
    }

    public function it_update_shield_image_disabled(
        SiteImageRepository $siteImageRepository,
        SiteImage $siteImage,
        EntityManagerInterface $em,
        MediaRepository $mediaRepository,
        SiteParameterRepository $siteParameterRepository,
        Manager $toggleManager,
        SiteParameter $currentIntroductionParameter,
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
        $siteImage->getKeyname()->willReturn(UpdateShieldAdminFormMutation::SHIELD_IMAGE_PARAMETER_KEY);

        $siteImageRepository->findOneBy(
            [
                'keyname' => UpdateShieldAdminFormMutation::SHIELD_IMAGE_PARAMETER_KEY,
            ]
        )->willReturn($siteImage);
        $media = null;
        $mediaRepository->find('image')->willReturn(null);
        $siteImage->setMedia($media)->shouldBeCalled();
        $siteImage->setIsEnabled(null !== $media)->shouldBeCalled();
        $siteImage->getMedia()->willReturn($media);
        $siteImage->getIsEnabled()->willReturn(false);

        $toggleManager->exists(UpdateShieldAdminFormMutation::SHIELD_MODE_TOGGLE_KEY)->willReturn(true);
        $toggleManager->set(UpdateShieldAdminFormMutation::SHIELD_MODE_TOGGLE_KEY, $shieldMode)->shouldBeCalled();
        $currentIntroductionParameter->setValue($introduction)->shouldBeCalled();
        $currentIntroductionParameter->getKeyname()->willReturn(
            UpdateShieldAdminFormMutation::SHIELD_INTRODUCTION_PARAMETER_KEY
        );

        $siteParameterRepository->findOneBy(
            [
                'keyname' => UpdateShieldAdminFormMutation::SHIELD_INTRODUCTION_PARAMETER_KEY,
            ]
        )->willReturn($currentIntroductionParameter);
        $em->flush()->shouldBeCalled();

        $this->__invoke($arguments)->shouldBe(['shieldAdminForm' => compact('media', 'introduction', 'shieldMode')]);
    }
}
