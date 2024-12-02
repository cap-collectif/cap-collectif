<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Factory\StepFactory;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AddStepService
{
    public function __construct(private readonly GlobalIdResolver $globalIdResolver, private readonly EntityManagerInterface $em, private readonly AuthorizationCheckerInterface $authorizationChecker, private readonly StepFactory $stepFactory)
    {
    }

    public function addStep(Argument $input, User $viewer, string $stepType): array
    {
        $projectId = $input->offsetGet('projectId');

        $project = $this->getProject($projectId, $viewer);
        $stepsCount = $project->getSteps()->count();

        $step = $this->createStepObject($stepType);
        $projectAbstractStep = (new ProjectAbstractStep())->setProject($project)->setStep($step)->setPosition($stepsCount + 1);
        $project->addStep($projectAbstractStep);
        $step->setProjectAbstractStep($projectAbstractStep);
        $step->setTitle('');

        $this->em->persist($step);
        $this->em->persist($projectAbstractStep);
        $this->em->flush();

        return ['step' => $step];
    }

    public function isGranted(string $projectId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }
        $project = $this->getProject($projectId, $viewer);

        return $this->authorizationChecker->isGranted(
            ProjectVoter::EDIT,
            $project
        );
    }

    public function getProject($projectId, User $viewer): Project
    {
        $project = $this->globalIdResolver->resolve($projectId, $viewer);

        if (!$project instanceof Project) {
            throw new UserError("Project with id {$projectId} was not found.");
        }

        return $project;
    }

    private function createStepObject(string $stepType): AbstractStep
    {
        return match ($stepType) {
            'COLLECT' => $this->stepFactory->createCollectStep(),
            'VOTE_AND_SELECTION' => $this->stepFactory->createVoteAndSelectionStep(),
            'DEBATE' => $this->stepFactory->createDebateStep(),
            'QUESTIONNAIRE' => $this->stepFactory->createQuestionnaireStep(),
            'CONSULTATION' => $this->stepFactory->createConsultationStep(),
            'ANALYSIS' => $this->stepFactory->createAnalysisStep(),
            'RESULT' => $this->stepFactory->createResultStep(),
            'SELECTION' => $this->stepFactory->createSelectionStep(),
            'OTHER' => $this->stepFactory->createOtherStep(),
            default => throw new UserError('Please select a valid step type'),
        };
    }
}
