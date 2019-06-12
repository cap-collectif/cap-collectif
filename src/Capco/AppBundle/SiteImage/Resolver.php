<?php

namespace Capco\AppBundle\SiteImage;

use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\MediaBundle\Entity\Media;

class Resolver
{
    protected $repository;

    public function __construct(SiteImageRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getMedia($key): ?Media
    {
        $images = $this->repository->getValuesIfEnabled();

        if (!isset($images[$key])) {
            return null;
        }

        return $images[$key]->getMedia();
    }
}
