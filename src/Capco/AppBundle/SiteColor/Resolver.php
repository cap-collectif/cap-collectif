<?php

namespace Capco\AppBundle\SiteColor;

use Capco\AppBundle\Repository\SiteColorRepository;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\NoResultException;

class Resolver
{
    protected $repository;
    protected $logger;

    public function __construct(SiteColorRepository $repository, LoggerInterface $logger)
    {
        $this->repository = $repository;
        $this->logger = $logger;
    }

    public function getValue($key)
    {
        $value = null;

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
