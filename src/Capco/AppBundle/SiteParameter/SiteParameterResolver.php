<?php

namespace Capco\AppBundle\SiteParameter;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class SiteParameterResolver
{
    protected $parameters;

    public function __construct(
        private readonly Manager $toggleManager,
        private readonly EntityManagerInterface $entityManager,
        private readonly RequestStack $requestStack,
        private readonly RedisCache $cache
    ) {
    }

    public function getValue(string $key, ?string $locale = null, ?string $defaultValue = null)
    {
        if (null === $locale && !$this->toggleManager->isActive('multilangue')) {
            $locale = $this->getDefaultLocale();
        }

        if (null === $locale && null !== $this->requestStack->getCurrentRequest()) {
            $locale =
                $this->requestStack->getCurrentRequest()->query->get('tl') ?:
                $this->requestStack->getCurrentRequest()->getLocale();

            // If request locale is not enabled, fallback to default locale
            if (!$this->entityManager
                ->getRepository(Locale::class)
                ->isCodePublished($locale)) {
                $locale = $this->getDefaultLocale();
            }
        }
        if (null === $locale) {
            $locale = $this->getDefaultLocale();
        }

        $cacheKey = 'site_parameters_' . $locale;
        $this->parameters = $this->cache->get($cacheKey, fn () => $this->entityManager
            ->getRepository(SiteParameter::class)
            ->getValues($locale));

        if (!isset($this->parameters[$key])) {
            return html_entity_decode($defaultValue ?? '');
        }
        $parameter = $this->parameters[$key];

        if (!$parameter->isTranslatable()) {
            $value = \is_string($parameter->getValue())
                ? html_entity_decode($parameter->getValue())
                : $parameter->getValue();

            if ($parameter->getType() === SiteParameter::$types['integer']) {
                $value = is_numeric($value) ? (int) $value : 0;
            }

            return $value;
        }

        $translatedValue = $parameter->getValue($locale);

        return \is_string($translatedValue)
            ? html_entity_decode($translatedValue)
            : $translatedValue;
    }

    public function getDefaultLocale(): string
    {
        return $this->entityManager
            ->getRepository(Locale::class)
            ->findDefaultLocale()
            ->getCode()
        ;
    }
}
