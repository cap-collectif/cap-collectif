<?php

namespace Capco\AppBundle\SiteImage;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Repository\SiteImageRepository;

class Resolver
{
    protected $repository;

    public function __construct(SiteImageRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getMedia(string $key): ?Media
    {
        $images = $this->repository->getValuesIfEnabled();

        if (!isset($images[$key])) {
            return null;
        }

        return $images[$key]->getMedia();
    }
}
