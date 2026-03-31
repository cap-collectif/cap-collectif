<?php

namespace Capco\AppBundle\Form\Persister\ProjectTab;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;

class DeleteProjectTabPersister extends AbstractProjectTabPersister
{
    /**
     * @return array<string, mixed>
     */
    public function persist(Argument $input, User $viewer): array
    {
        $tabId = (string) $input->offsetGet('tabId');
        $projectTab = $this->getProjectTab($tabId, $viewer);
        if (!$projectTab) {
            return ['deletedProjectTabId' => null, 'errorCode' => self::PROJECT_TAB_NOT_FOUND];
        }

        $project = $projectTab->getProject();
        if ($project) {
            $project->removeTab($projectTab);
            $position = 1;
            foreach ($project->getTabs() as $remainingTab) {
                $remainingTab->setPosition($position++);
            }
        }

        $this->em->remove($projectTab);
        $this->em->flush();

        return ['deletedProjectTabId' => $tabId, 'errorCode' => null];
    }
}
