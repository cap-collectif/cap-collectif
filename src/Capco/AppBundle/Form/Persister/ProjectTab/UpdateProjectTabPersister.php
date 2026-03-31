<?php

namespace Capco\AppBundle\Form\Persister\ProjectTab;

use Capco\AppBundle\Entity\ProjectTab;
use Capco\AppBundle\Entity\ProjectTabEvents;
use Capco\AppBundle\Entity\ProjectTabNews;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;

class UpdateProjectTabPersister extends AbstractProjectTabPersister
{
    /**
     * @param class-string<ProjectTab> $projectTabClass
     *
     * @return array<string, mixed>
     */
    public function persist(string $projectTabClass, Argument $input, User $viewer): array
    {
        $projectTab = $this->getProjectTab((string) $input->offsetGet('tabId'), $viewer);
        if (!$projectTab) {
            return ['projectTab' => null, 'errorCode' => self::PROJECT_TAB_NOT_FOUND];
        }

        if (!$projectTab instanceof $projectTabClass) {
            return ['projectTab' => null, 'errorCode' => self::INVALID_TAB_TYPE];
        }

        $errorCode = $this->validateCommonFields($projectTab, $input, $projectTab);
        if ($errorCode) {
            return ['projectTab' => null, 'errorCode' => $errorCode];
        }

        $errorCode = $this->validateTypeSpecificFields($projectTab, $input, $viewer);
        if ($errorCode) {
            return ['projectTab' => null, 'errorCode' => $errorCode];
        }

        $this->em->flush();

        return ['projectTab' => $projectTab, 'errorCode' => null];
    }

    private function validateTypeSpecificFields(ProjectTab $projectTab, Argument $input, User $viewer): ?string
    {
        if ($projectTab instanceof ProjectTabNews) {
            return $this->replaceNewsItems($projectTab, $input, $viewer);
        }

        if ($projectTab instanceof ProjectTabEvents) {
            return $this->replaceEventItems($projectTab, $input, $viewer);
        }

        return $this->validateBody($projectTab, $input);
    }
}
