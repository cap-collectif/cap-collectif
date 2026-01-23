<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\Twig\FooterRuntime;
use Capco\AppBundle\Twig\ParametersRuntime;
use Capco\AppBundle\Twig\SiteParameterRuntime;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Doctrine\ORM\Event\PostFlushEventArgs;
use Doctrine\ORM\Events;

class SiteParameterCacheSubscriber implements EventSubscriber
{
    /**
     * @var array<array{keyname: string, locale: ?string}>
     */
    private array $pendingInvalidations = [];

    public function __construct(
        private readonly RedisCache $cache,
        private readonly EntityManagerInterface $entityManager,
        private readonly SiteParameterResolver $siteParameterResolver
    ) {
    }

    public function getSubscribedEvents(): array
    {
        return [Events::postPersist, Events::postUpdate, Events::postRemove, Events::postFlush];
    }

    public function postPersist(LifecycleEventArgs $args): void
    {
        $this->collectEntity($args->getEntity());
    }

    public function postUpdate(LifecycleEventArgs $args): void
    {
        $this->collectEntity($args->getEntity());
    }

    public function postRemove(LifecycleEventArgs $args): void
    {
        $this->collectEntity($args->getEntity());
    }

    public function postFlush(PostFlushEventArgs $args): void
    {
        if (empty($this->pendingInvalidations)) {
            return;
        }

        $invalidations = $this->pendingInvalidations;
        $this->pendingInvalidations = [];

        foreach ($invalidations as $invalidation) {
            $locales = $invalidation['locale']
                ? [$invalidation['locale']]
                : $this->getPublishedLocales();

            $this->invalidateByKeyAndLocales($invalidation['keyname'], $locales);
        }
    }

    private function collectEntity(object $entity): void
    {
        if ($entity instanceof SiteParameterTranslation) {
            $translatable = $entity->getTranslatable();
            if ($translatable instanceof SiteParameter) {
                $this->pendingInvalidations[] = [
                    'keyname' => $translatable->getKeyname(),
                    'locale' => $entity->getLocale(),
                ];
            }

            return;
        }

        if ($entity instanceof SiteParameter) {
            $this->pendingInvalidations[] = [
                'keyname' => $entity->getKeyname(),
                'locale' => null,
            ];
        }
    }

    /**
     * @param array<int, string> $locales
     */
    private function invalidateByKeyAndLocales(string $keyname, array $locales): void
    {
        if ([] === $locales) {
            $locales = [$this->siteParameterResolver->getDefaultLocale()];
        }

        $resultCache = $this->entityManager->getConfiguration()->getResultCacheImpl();
        foreach ($locales as $locale) {
            $this->cache->deleteItem('site_parameters_' . $locale);
            $this->cache->deleteItem(SiteParameterRuntime::getCacheKey($keyname, $locale));
            $this->cache->deleteItem(ParametersRuntime::getCacheKey($locale));
            $this->cache->deleteItem(FooterRuntime::generateFooterLegalCacheKey($locale));
            $this->cache->deleteItem(FooterRuntime::generateFooterSocialNetworksCacheKey($locale));

            if ($resultCache) {
                $resultCache->delete(SiteParameterRepository::getValuesIfEnabledCacheKey($locale));
                $resultCache->delete(SiteParameterRepository::getValueCacheKey($locale, $keyname));
            }
        }
    }

    /**
     * @return array<int, string>
     */
    private function getPublishedLocales(): array
    {
        $locales = $this->entityManager
            ->getRepository(Locale::class)
            ->findPublishedLocales()
        ;

        return array_map(static fn (Locale $locale) => $locale->getCode(), $locales);
    }
}
