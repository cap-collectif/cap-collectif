<?php

namespace Capco\AppBundle\SiteParameter;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;

class SiteParameterResolver
{
    protected $parameters;
    protected $toggleManager;
    protected $entityManager;

    public function __construct(Manager $toggleManager, EntityManagerInterface $entityManager)
    {
        $this->toggleManager = $toggleManager;
        $this->entityManager = $entityManager;
    }

    public function getValue(string $key, ?string $locale = null, ?string $defaultValue = null)
    {
        if ('global.locale' === $key && $this->toggleManager->isActive('unstable__multilangue')) {
            return $this->getDefaultLocale();
        }

        if (!$this->parameters) {
            $this->parameters = $this->entityManager
                ->getRepository(SiteParameter::class)
                ->getValuesIfEnabled();
        }

        if (!isset($this->parameters[$key])) {
            return html_entity_decode($defaultValue);
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
        return $this->entityManager->getRepository(Locale::class)->findDefaultLocale();
    }
}
