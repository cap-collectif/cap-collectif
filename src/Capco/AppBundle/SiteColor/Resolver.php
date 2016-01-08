<?php

namespace Capco\AppBundle\SiteColor;

use Capco\AppBundle\Repository\SiteColorRepository;
use Psr\Log\LoggerInterface;

class Resolver
{
    protected $repository;
    protected $logger;
    protected $colors;

    public function __construct(SiteColorRepository $repository, LoggerInterface $logger)
    {
        $this->repository = $repository;
        $this->logger = $logger;
        $this->colors = $this->repository->getValuesIfEnabled();
    }

    public function getValue($key)
    {
        if (!array_key_exists($key, $this->colors)) {
            return;
        }

        return $this->colors[$key]['value'];
    }
}
