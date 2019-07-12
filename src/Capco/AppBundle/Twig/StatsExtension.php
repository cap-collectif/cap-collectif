<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Resolver\ProjectStatsResolver;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class StatsExtension extends AbstractExtension
{
    protected $projectStatsResolver;

    public function __construct(ProjectStatsResolver $projectStatsResolver)
    {
        $this->projectStatsResolver = $projectStatsResolver;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('capco_has_stats', [$this, 'hasStats'])];
    }

    public function hasStats(Project $project): bool
    {
        return $this->projectStatsResolver->hasStepsWithStats($project);
    }
}
