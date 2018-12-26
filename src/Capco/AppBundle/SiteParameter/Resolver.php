<?php

namespace Capco\AppBundle\SiteParameter;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Psr\Log\LoggerInterface;

class Resolver
{
    protected $repository;
    protected $logger;
    protected $parameters;

    public function __construct(SiteParameterRepository $repository, LoggerInterface $logger)
    {
        $this->repository = $repository;
        $this->logger = $logger;
    }

    public function getValue(?string $key, ?string $value = null): ?string
    {
        if (!$this->parameters) {
            $this->parameters = $this->repository->getValuesIfEnabled();
        }
        if (!isset($this->parameters[$key])) {
            return $value;
        }

        $value = $this->parameters[$key]['value'];

        if ($this->parameters[$key]['type'] === SiteParameter::$types['integer']) {
            $value = is_numeric($value) ? (int) $value : 0;
        }

        return $value;
    }
}
