<?php

namespace Capco\AppBundle\SiteParameter;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class SiteParameterResolver
{
    protected $parameters = [];
    protected $toggleManager;
    protected $entityManager;
    protected $requestStack;

    public function __construct(Manager $toggleManager, EntityManagerInterface $entityManager, RequestStack $requestStack)
    {
        $this->toggleManager = $toggleManager;
        $this->entityManager = $entityManager;
        $this->requestStack = $requestStack;
    }

    public function getValue(string $key, ?string $locale = null, ?string $defaultValue = null)
    {

        if ('global.locale' === $key && $this->toggleManager->isActive('unstable__multilangue')) {
            return $this->getDefaultLocale();
        }

        if ($locale === null && $this->requestStack->getCurrentRequest() !== null) {
            $locale = $this->requestStack->getCurrentRequest()->query->get('tl')
                ?: $this->requestStack->getCurrentRequest()->getLocale();
        }
        if ($locale === null) {
            $locale = $this->getDefaultLocaleLegacy();
        }

        if (!isset($this->parameters[$locale]) || empty($this->parameters[$locale])) {
            $this->parameters[$locale] = $this->entityManager
                ->getRepository(SiteParameter::class)
                ->getValuesIfEnabled($locale);
        }

        if (!isset($this->parameters[$locale][$key])) {
            return html_entity_decode($defaultValue);
        }
        $parameter = $this->parameters[$locale][$key];

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

    private function getDefaultLocaleLegacy(): string
    {
        if ($this->toggleManager->isActive('unstable__multilangue')){
            return $this->getDefaultLocale();
        }
        $locale = $this->entityManager->getRepository(SiteParameter::class)->findOneByKeyname('global.locale');
        if ($locale){
            return $locale->getValue();
        }
        return 'fr-FR';
    }

    public function getDefaultLocale(): string
    {
        return $this->entityManager->getRepository(Locale::class)->findDefaultLocale()->getCode();
    }
}
