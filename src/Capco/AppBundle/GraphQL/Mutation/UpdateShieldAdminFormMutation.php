<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\MediaBundle\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateShieldAdminFormMutation implements MutationInterface
{
    private const SHIELD_MODE_TOGGLE_KEY = 'shield_mode';
    private const SHIELD_INTRODUCTION_PARAMETER_KEY = 'shield.introduction';
    private const SHIELD_IMAGE_PARAMETER_KEY = 'image.shield';

    private $siteImageRepository;
    private $mediaRepository;
    private $em;
    private $toggleManager;
    private $siteParameterRepository;

    public function __construct(
        SiteImageRepository $siteImageRepository,
        EntityManagerInterface $em,
        MediaRepository $mediaRepository,
        SiteParameterRepository $siteParameterRepository,
        Manager $toggleManager
    ) {
        $this->siteImageRepository = $siteImageRepository;
        $this->mediaRepository = $mediaRepository;
        $this->em = $em;
        $this->siteParameterRepository = $siteParameterRepository;
        $this->toggleManager = $toggleManager;
    }

    public function __invoke(Argument $input): array
    {
        list($mediaId, $shieldMode, $introduction) = [
            $input->offsetGet('mediaId'),
            $input->offsetGet('shieldMode'),
            $input->offsetGet('introduction')
        ];

        $siteImage = $this->siteImageRepository->findOneBy([
            'keyname' => self::SHIELD_IMAGE_PARAMETER_KEY
        ]);

        if (!$siteImage) {
            throw new UserError('Media not found!');
        }

        $media = $mediaId ? $this->mediaRepository->find($mediaId) : null;
        $siteImage->setMedia($media);
        $siteImage->setIsEnabled(null !== $media);

        if ($this->toggleManager->exists(self::SHIELD_MODE_TOGGLE_KEY)) {
            $this->toggleManager->set(self::SHIELD_MODE_TOGGLE_KEY, $shieldMode);
        }

        $currentIntroductionParameter = $this->siteParameterRepository->findOneBy([
            'keyname' => self::SHIELD_INTRODUCTION_PARAMETER_KEY
        ]);
        $currentIntroductionParameter->setValue($introduction);
        $this->em->flush();

        return ['shieldAdminForm' => compact('media', 'introduction', 'shieldMode')];
    }
}
