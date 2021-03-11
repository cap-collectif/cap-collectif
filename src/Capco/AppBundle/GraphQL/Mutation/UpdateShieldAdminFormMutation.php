<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\MediaBundle\Entity\Media;
use Capco\AppBundle\Twig\ParametersRuntime;
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

    private SiteImageRepository $siteImageRepository;
    private MediaRepository $mediaRepository;
    private EntityManagerInterface $em;
    private Manager $toggleManager;
    private SiteParameterRepository $siteParameterRepository;
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
        $media = $this->updateMedia($input);
        $shieldMode = $this->updateShieldMode($input);
        $introduction = $this->updateIntroduction($input);

        $this->em->flush();

        $translations = [];
        foreach ($introduction->getTranslations() as $translation) {
            $translations[] = [
                'locale' => $translation->getLocale(),
                'introduction' => $translation->getValue(),
            ];
        }

        return [
            'shieldAdminForm' => [
                'media' => $media,
                'shieldMode' => $shieldMode,
                'introduction' => $introduction->getValue(),
                'translations' => $translations,
            ],
        ];
    }

    private function updateIntroduction(Argument $input): SiteParameter
    {
        $parameter = $this->siteParameterRepository->findOneBy([
            'keyname' => self::SHIELD_INTRODUCTION_PARAMETER_KEY,
        ]);
        $newTranslations = $input->offsetGet('translations') ?? [];
        foreach ($newTranslations as $newTranslation) {
            $this->updateIntroductionTranslation(
                $parameter,
                $newTranslation['introduction'],
                $newTranslation['locale']
            );
        }
        $this->cleanOldTranslations($parameter, $newTranslations);

        return $parameter;
    }

    private function cleanOldTranslations(SiteParameter $parameter, array $newTranslations): void
    {
        foreach ($parameter->getTranslations() as $oldTranslation) {
            foreach ($newTranslations as $newTranslation) {
                if ($oldTranslation->getLocale() === $newTranslation['locale']) {
                    return;
                }
            }
            $parameter->getTranslations()->removeElement($oldTranslation);
        }
    }

    private function updateIntroductionTranslation(
        SiteParameter $parameter,
        ?string $translation,
        string $locale
    ): SiteParameter {
        foreach ($parameter->getTranslations() as $oldTranslation) {
            if ($oldTranslation->getLocale() === $locale) {
                $oldTranslation->setValue($translation);

                return $parameter;
            }
        }

        $oldTranslation = $this->em
            ->getRepository(SiteParameterTranslation::class)
            ->findOneBy(['translatable' => $parameter, 'locale' => $locale]);
        if ($oldTranslation) {
            $oldTranslation->setValue($translation);
            $parameter->addTranslation($oldTranslation);
        } else {
            $newTranslation = (new SiteParameterTranslation())
                ->setTranslatable($parameter)
                ->setLocale($locale)
                ->setValue($translation);
            $parameter->addTranslation($newTranslation);
            $this->em->persist($newTranslation);
            $this->cache->deleteItem(ParametersRuntime::CACHE_KEY . $locale);
        }

        return $parameter;
    }

    private function updateMedia(Argument $input): ?Media
    {
        $siteImage = $this->siteImageRepository->findOneBy([
            'keyname' => self::SHIELD_IMAGE_PARAMETER_KEY,
        ]);

        if (!$siteImage) {
            throw new UserError('Media not found!');
        }
        $mediaId = $input->offsetGet('mediaId');
        $media = $mediaId ? $this->mediaRepository->find($mediaId) : null;
        $siteImage->setMedia($media);
        $siteImage->setIsEnabled(null !== $media);

        return $media;
    }

    private function updateShieldMode(Argument $input): bool
    {
        if ($this->toggleManager->exists(self::SHIELD_MODE_TOGGLE_KEY)) {
            $this->toggleManager->set(
                self::SHIELD_MODE_TOGGLE_KEY,
                $input->offsetGet('shieldMode')
            );
        }

        return $input->offsetGet('shieldMode');
    }
}
