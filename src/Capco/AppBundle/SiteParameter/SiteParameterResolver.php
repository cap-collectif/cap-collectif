<?php

namespace Capco\AppBundle\SiteParameter;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Psr\Log\LoggerInterface;

class SiteParameterResolver
{
    protected $repository;
    protected $parameters;

    public function __construct(SiteParameterRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getValue(string $key, ?string $locale = null, ?string $defaultValue = null)
    {
        if (!$this->parameters) {
            $this->parameters = $this->repository->getValuesIfEnabled();
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

        $transltatedValue = $parameter->getValue($locale);

        return \is_string($transltatedValue)
        ? html_entity_decode($transltatedValue)
        : $transltatedValue;
    }
}
