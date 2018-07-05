<?php
namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;

class StepResolver
{
    private $urlResolver;

    public function __construct(UrlResolver $urlResolver)
    {
        $this->urlResolver = $urlResolver;
    }

    public function getLink(?AbstractStep $step = null, $absolute = false)
    {
        return $this->urlResolver->getObjectUrl($step, $absolute);
    }

    public function getFirstStepLinkForProject(Project $project, $absolute = false)
    {
        return $this->getLink($project->getFirstStep(), $absolute);
    }

    public function getCurrentStepLinkForProject(Project $project, $absolute = false)
    {
        return $this->getLink($project->getCurrentStep(), $absolute);
    }
}
