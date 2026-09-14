<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\FooterSocialNetwork;
use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Capco\AppBundle\Twig\FooterRuntime;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Doctrine\ORM\Event\PostFlushEventArgs;
use Doctrine\ORM\Events;

class FooterSocialNetworkCacheSubscriber implements EventSubscriber
{
    private bool $shouldInvalidate = false;

    public function __construct(
        private readonly RedisCache $cache,
        private readonly EntityManagerInterface $entityManager
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
        if (!$this->shouldInvalidate) {
            return;
        }

        $this->shouldInvalidate = false;

        $resultCache = $this->entityManager->getConfiguration()->getResultCacheImpl();
        $resultCache?->delete(FooterSocialNetworkRepository::getEnabledCacheKey());

        foreach ($this->getPublishedLocales() as $locale) {
            $this->cache->deleteItem(FooterRuntime::generateFooterSocialNetworksCacheKey($locale));
        }
    }

    private function collectEntity(object $entity): void
    {
        if ($entity instanceof FooterSocialNetwork) {
            $this->shouldInvalidate = true;
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
