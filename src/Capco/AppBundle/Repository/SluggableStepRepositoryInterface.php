<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Interfaces\SluggableInterface;

interface SluggableStepRepositoryInterface
{
    public function getBySlug(string $slug, string $projectSlug): ?SluggableInterface;
}
