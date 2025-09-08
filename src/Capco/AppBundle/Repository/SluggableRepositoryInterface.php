<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Interfaces\SluggableInterface;

interface SluggableRepositoryInterface
{
    public function getBySlug(string $slug): ?SluggableInterface;
}
