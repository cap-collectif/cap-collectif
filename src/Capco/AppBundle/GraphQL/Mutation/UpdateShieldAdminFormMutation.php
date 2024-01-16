<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Twig\ParametersRuntime;
use Capco\MediaBundle\Entity\Media;
use Capco\MediaBundle\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateShieldAdminFormMutation implements MutationInterface
{
    use MutationTrait;

    public const SHIELD_MODE_TOGGLE_KEY = 'shield_mode';
    public const SHIELD_INTRODUCTION_PARAMETER_KEY = 'shield.introduction';
    public const SHIELD_IMAGE_PARAMETER_KEY = 'image.shield';

    private SiteImageRepository $siteImageRepository;
    private MediaRepository $mediaRepository;
    private EntityManagerInterface $em;
    private Manager $toggleManager;
    private SiteParameterRepository $siteParameterRepository;
    private RedisCache $cache;
    private UpdateSiteParameterMutation $updateSiteParameterMutation;

    public function __construct(
        RedisCache $cache,
        SiteImageRepository $siteImageRepository,
        EntityManagerInterface $em,
        MediaRepository $mediaRepository,
        SiteParameterRepository $siteParameterRepository,
        Manager $toggleManager,
        UpdateSiteParameterMutation $updateSiteParameterMutation
    ) {
        $this->siteImageRepository = $siteImageRepository;
        $this->mediaRepository = $mediaRepository;
        $this->em = $em;
        $this->siteParameterRepository = $siteParameterRepository;
        $this->toggleManager = $toggleManager;
        $this->cache = $cache;
        $this->updateSiteParameterMutation = $updateSiteParameterMutation;
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
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
        $this->updateSiteParameterMutation->invalidateCache($parameter);

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
            ->findOneBy(['translatable' => $parameter, 'locale' => $locale])
        ;
        if ($oldTranslation) {
            $oldTranslation->setValue($translation);
            $parameter->addTranslation($oldTranslation);
        } else {
            $newTranslation = (new SiteParameterTranslation())
                ->setTranslatable($parameter)
                ->setLocale($locale)
                ->setValue($translation)
            ;
            $parameter->addTranslation($newTranslation);
            $this->em->persist($newTranslation);
            $this->cache->deleteItem(ParametersRuntime::CACHE_KEY . $locale);
        }

        $this->updateSiteParameterMutation->invalidateCache($parameter);

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

        $cacheDriver = $this->em->getConfiguration()->getResultCacheImpl();
        $cacheDriver->delete(SiteImageRepository::getValuesIfEnabledCacheKey());

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
