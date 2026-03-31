<?php

namespace Capco\AppBundle\Form\Persister\ProjectTab;

use Capco\AppBundle\Entity\ProjectTab;
use Capco\AppBundle\Entity\ProjectTabEvents;
use Capco\AppBundle\Entity\ProjectTabNews;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;

class CreateProjectTabPersister extends AbstractProjectTabPersister
{
    /**
     * @param class-string<ProjectTab> $projectTabClass
     *
     * @return array<string, mixed>
     */
    public function persist(string $projectTabClass, Argument $input, User $viewer): array
    {
        $project = $this->getProject((string) $input->offsetGet('projectId'), $viewer);
        if (!$project) {
            return ['projectTab' => null, 'errorCode' => self::PROJECT_NOT_FOUND];
        }

        /** @var ProjectTab $projectTab */
        $projectTab = new $projectTabClass();
        $projectTab
            ->setProject($project)
            ->setPosition(\count($project->getTabs()) + 1)
        ;

        $errorCode = $this->validateCommonFields($projectTab, $input);
        if ($errorCode) {
            return ['projectTab' => null, 'errorCode' => $errorCode];
        }

        $errorCode = $this->validateTypeSpecificFields($projectTab, $input, $viewer);
        if ($errorCode) {
            return ['projectTab' => null, 'errorCode' => $errorCode];
        }

        $project->addTab($projectTab);
        $this->em->persist($projectTab);
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
