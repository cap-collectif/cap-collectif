<?php

namespace Capco\AppBundle\SiteParameter;

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
        $this->parameters = $this->repository->getValuesIfEnabled();
    }

    public function getValue($key, $value = null)
    {
        if (!array_key_exists($key, $this->parameters)) {
            $this->logger->error('Tried to access undefined site parameters.', array(
                'key' => $key,
            ));

            return $value;
        }

        return $this->parameters[$key]['value'];
    }
}
