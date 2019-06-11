<?php

namespace Capco\AppBundle\SiteImage;

use Capco\AppBundle\Repository\SiteImageRepository;
use Psr\Log\LoggerInterface;

class Resolver
{
    protected $repository;
    protected $logger;
    protected $images = null;

    public function __construct(SiteImageRepository $repository, LoggerInterface $logger)
    {
        $this->repository = $repository;
        $this->logger = $logger;
    }

    public function getMedia($key)
    {
        if (!$this->images) {
            $this->images = $this->repository->getValuesIfEnabled();
        }

        if (!isset($this->images[$key])) {
            return;
        }

        return $this->images[$key]->getMedia();
    }
}
