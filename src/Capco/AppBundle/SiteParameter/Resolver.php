<?php

namespace Capco\AppBundle\SiteParameter;

use Capco\AppBundle\Repository\SiteParameterRepository;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\NoResultException;

class Resolver
{
    protected $repository;
    protected $logger;

    public function __construct(SiteParameterRepository $repository, LoggerInterface $logger)
    {
        $this->repository = $repository;
        $this->logger = $logger;
    }

    public function getValue($key, $value = null)
    {
        try {
            $value = $this->repository->getValueByKeyIfEnabled($key);
        } catch (NoResultException $e) {
            $this->logger->error($e->getMessage().' Tried to access undefined site parameter.', array(
                'key' => $key,
            ));
        }

        return $value;
    }
}
