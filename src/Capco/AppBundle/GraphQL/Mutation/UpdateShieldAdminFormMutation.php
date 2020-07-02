<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Twig\ParametersExtension;
use Capco\MediaBundle\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateShieldAdminFormMutation implements MutationInterface
{
    public const SHIELD_MODE_TOGGLE_KEY = 'shield_mode';
    public const SHIELD_INTRODUCTION_PARAMETER_KEY = 'shield.introduction';
    public const SHIELD_IMAGE_PARAMETER_KEY = 'image.shield';

    private $siteImageRepository;
    private $mediaRepository;
    private $em;
    private $toggleManager;
    private $siteParameterRepository;
    private RedisCache $cache;

    public function __construct(
        RedisCache $cache,
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
        $this->cache = $cache;
    }

    public function __invoke(Argument $input): array
    {
        list($mediaId, $shieldMode, $introduction) = [
            $input->offsetGet('mediaId'),
            $input->offsetGet('shieldMode'),
            $input->offsetGet('introduction'),
        ];

        $siteImage = $this->siteImageRepository->findOneBy([
            'keyname' => self::SHIELD_IMAGE_PARAMETER_KEY,
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

        if (
            $currentIntroductionParameter = $this->siteParameterRepository->findOneBy([
                'keyname' => self::SHIELD_INTRODUCTION_PARAMETER_KEY,
            ])
        ) {
            $currentIntroductionParameter->setValue($introduction);
            $currentIntroductionParameter->mergeNewTranslations();
        }

        $this->em->flush();
        $locales = $this->em->getRepository(Locale::class)->findAll();
        /** @var Locale $locale */
        foreach ($locales as $locale) {
            $this->cache->deleteItem(ParametersExtension::CACHE_KEY . $locale->getCode());
        }

        return ['shieldAdminForm' => compact('media', 'introduction', 'shieldMode')];
    }
}
