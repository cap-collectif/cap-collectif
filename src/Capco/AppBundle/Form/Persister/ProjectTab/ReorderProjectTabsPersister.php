<?php

namespace Capco\AppBundle\Form\Persister\ProjectTab;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;

class ReorderProjectTabsPersister extends AbstractProjectTabPersister
{
    /**
     * @return array<string, mixed>
     */
    public function persist(Argument $input, User $viewer): array
    {
        $project = $this->getProject((string) $input->offsetGet('projectId'), $viewer);
        if (!$project) {
            return ['project' => null, 'errorCode' => self::PROJECT_NOT_FOUND];
        }

        $tabIds = $input->offsetGet('tabIds');
        if (!\is_array($tabIds) || \count($tabIds) !== \count($project->getTabs())) {
            return ['project' => null, 'errorCode' => self::INVALID_REORDER];
        }

        $resolvedIds = [];
        foreach ($tabIds as $index => $tabId) {
            $projectTab = $this->getProjectTab((string) $tabId, $viewer);
            if (!$projectTab || $projectTab->getProject()?->getId() !== $project->getId()) {
                return ['project' => null, 'errorCode' => self::INVALID_REORDER];
            }

            if (\in_array($projectTab->getId(), $resolvedIds, true)) {
                return ['project' => null, 'errorCode' => self::INVALID_REORDER];
            }
            $resolvedIds[] = $projectTab->getId();
            $projectTab->setPosition($index + 1);
        }

        $this->em->flush();
        $this->em->refresh($project);

        return ['project' => $project, 'errorCode' => null];
    }
}
