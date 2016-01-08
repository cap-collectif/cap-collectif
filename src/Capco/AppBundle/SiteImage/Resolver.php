<?php

namespace Capco\AppBundle\SiteImage;

use Capco\AppBundle\Repository\SiteImageRepository;
use Psr\Log\LoggerInterface;

class Resolver
{
    protected $repository;
    protected $logger;
    protected $images;

    public function __construct(SiteImageRepository $repository, LoggerInterface $logger)
    {
        $this->repository = $repository;
        $this->logger = $logger;
        $this->images = $this->repository->getValuesIfEnabled();
    }

    public function getMedia($key)
    {
        if (!array_key_exists($key, $this->images)) {
            return;
        }

        return $this->images[$key]->getMedia();
    }
}
