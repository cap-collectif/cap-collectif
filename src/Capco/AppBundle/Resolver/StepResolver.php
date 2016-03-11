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

    public function getLink(AbstractStep $step = null, $absolute = false)
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

    public function getOpeningStatus(AbstractStep $step)
    {
        if ($step->getStartAt()) {
            if ($step->isFuture()) {
                return 'future';
            }
            if ($step->isClosed()) {
                return 'closed';
            }
            if ($step->isOpen()) {
                return 'open';
            }
        }
        $previousStep = $this->getPreviousStep($step);
        if ($previousStep) {
            $previousStepStatus = $this->getOpeningStatus($previousStep);
            return $previousStepStatus !== 'closed' ? 'future' : 'closed';
        }
        return 'closed';
    }

    private function getPreviousStep(AbstractStep $step)
    {
        $position = $step->getProjectAbstractStep()->getPosition();
        $project = $step->getProject();
        $otherSteps = $project->getSteps();
        $previousStep = null;
        foreach ($otherSteps as $otherStep) {
            if ($otherStep->getPosition() === $position -1) {
                $previousStep = $otherStep->getStep();
                break;
            }
        }
        return $previousStep;

    }
}
