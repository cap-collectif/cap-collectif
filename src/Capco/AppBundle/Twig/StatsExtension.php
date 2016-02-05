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

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'capco_stats';
    }

    public function getFunctions()
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
