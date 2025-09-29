<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Twig\ParametersRuntime;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateShieldAdminFormMutation implements MutationInterface
{
    use MutationTrait;

    final public const SHIELD_MODE_TOGGLE_KEY = 'shield_mode';
    final public const SHIELD_INTRODUCTION_PARAMETER_KEY = 'shield.introduction';
    final public const SHIELD_IMAGE_PARAMETER_KEY = 'image.shield';

    public function __construct(
        private readonly RedisCache $cache,
        private readonly SiteImageRepository $siteImageRepository,
        private readonly EntityManagerInterface $em,
        private readonly MediaRepository $mediaRepository,
        private readonly SiteParameterRepository $siteParameterRepository,
        private readonly Manager $toggleManager,
        private readonly UpdateSiteParameterMutation $updateSiteParameterMutation
    ) {
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
        /** * @var Media $media | null  */
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
