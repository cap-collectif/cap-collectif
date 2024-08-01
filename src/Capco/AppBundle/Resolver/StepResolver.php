<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;

class StepResolver
{
    private UrlResolver $urlResolver;

    public function __construct(UrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }

    public function getLink(?AbstractStep $step = null, bool $absolute = false): string
    {
        return $this->urlResolver->getObjectUrl($step, $absolute);
    }

    public function getFirstStepLinkForProject(Project $project, bool $absolute = false): string
    {
        return $this->getLink($project->getFirstStep(), $absolute);
    }

    public function getCurrentStepLinkForProject(Project $project, bool $absolute = false): string
    {
        return $this->getLink($project->getCurrentStep(), $absolute);
    }
}
