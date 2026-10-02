<?php

namespace Capco\AppBundle\Service;

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
        if (!$this->toggleManager->isActive(Manager::hub_api_green)) {
            return false;
        }

        if (!$step instanceof OtherStep) {
            return false;
        }

        $projectTypeSlug = $step->getProject()?->getProjectType()?->getSlug();

        return $step->getHubMetadata()?->isEnabled()
            && \in_array($projectTypeSlug, self::HUB_DOCUMENTS_PROJECT_TYPES, true);
    }
}
