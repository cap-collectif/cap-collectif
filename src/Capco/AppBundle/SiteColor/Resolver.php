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
    }

    public function getValue($key)
    {
        if (!$this->colors) {
            $this->colors = $this->repository->getValuesIfEnabled();
        }
        if (!isset($this->colors[$key])) {
            return null;
        }

        return $this->colors[$key]['value'];
    }
}
