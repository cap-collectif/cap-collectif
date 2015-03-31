<?php

namespace Capco\AppBundle\SiteColor;

use Capco\AppBundle\Repository\SiteColorRepository;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\NoResultException;
use Doctrine\Common\Collections\ArrayCollection;

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
        foreach ($this->colors as $color) {
            if ($color['keyname'] == $key) {
                return $color['value'];
            }
        }

        $this->logger->error($e->getMessage().' Tried to access undefined site parameter.', array(
            'key' => $key,
        ));

        return null;
    }
}
