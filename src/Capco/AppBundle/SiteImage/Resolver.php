<?php

namespace Capco\AppBundle\SiteImage;

use Capco\AppBundle\Repository\SiteImageRepository;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\NoResultException;

class Resolver
{
    protected $repository;
    protected $logger;

    public function __construct(SiteImageRepository $repository, LoggerInterface $logger)
    {
        $this->repository = $repository;
        $this->logger = $logger;
    }

    public function getMedia($key)
    {
        $media = null;

        try {
            $media = $this->repository->getMediaByKeyIfEnabled($key);
        } catch (NoResultException $e) {
            $this->logger->error($e->getMessage() . ' Tried to access undefined site parameter.', array(
                'key' => $key
            ));
        }

        return $media;
    }
}
