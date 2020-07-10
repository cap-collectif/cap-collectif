<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Resolver\ProjectStatsResolver;
use Twig\Extension\RuntimeExtensionInterface;

class StatsRuntime implements RuntimeExtensionInterface
{
    protected $projectStatsResolver;

    public function __construct(ProjectStatsResolver $projectStatsResolver)
    {
        $this->projectStatsResolver = $projectStatsResolver;
    }

    public function hasStats(Project $project): bool
    {
        return $this->projectStatsResolver->hasStepsWithStats($project);
    }
}
