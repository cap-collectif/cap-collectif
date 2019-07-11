<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Resolver\ProjectStatsResolver;

class StatsExtension extends \Twig_Extension
{
    protected $projectStatsResolver;

    public function __construct(ProjectStatsResolver $projectStatsResolver)
    {
        $this->projectStatsResolver = $projectStatsResolver;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('capco_has_stats', [$this, 'hasStats']),
        ];
    }

    public function hasStats(Project $project)
    {
        return $this->projectStatsResolver->hasStepsWithStats($project);
    }
}
