<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Toggle\Manager;

class HubDocumentsStepGuard
{
    private const HUB_DOCUMENTS_PROJECT_TYPES = [
        'public-inquiry',
        'public-consultation',
    ];

    public function __construct(private readonly Manager $toggleManager)
    {
    }

    public function isProtectedDocumentsStep(AbstractStep $step): bool
    {
        if (!$step instanceof OtherStep) {
            return false;
        }

        return $step->getHubMetadata()?->isEnabled()
            && $this->isProtectedDocumentsProject($step->getProject());
    }

    public function isProtectedDocumentsProject(?Project $project): bool
    {
        if (!$this->toggleManager->isActive(Manager::hub_api_green) || null === $project) {
            return false;
        }

        return \in_array($project->getProjectType()?->getSlug(), self::HUB_DOCUMENTS_PROJECT_TYPES, true);
    }
}
