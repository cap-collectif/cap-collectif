<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Steps\RankingStep;

class RankingStepRepository extends AbstractStepRepository
{
    public function getOneBySlugAndProjectSlug(string $slug, string $projectSlug): ?RankingStep
    {
        return parent::getOneBySlugAndProjectSlug($slug, $projectSlug);
    }
}
