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
    private readonly GlobalIdResolver $globalIdResolver;
    private readonly EntityManagerInterface $em;
    private readonly AuthorizationCheckerInterface $authorizationChecker;
    private readonly StepFactory $stepFactory;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        AuthorizationCheckerInterface $authorizationChecker,
        StepFactory $stepFactory
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->authorizationChecker = $authorizationChecker;
        $this->stepFactory = $stepFactory;
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
        switch ($stepType) {
            case 'COLLECT':
                return $this->stepFactory->createCollectStep();

            case 'VOTE_AND_SELECTION':
                return $this->stepFactory->createVoteAndSelectionStep();

            case 'DEBATE':
                return $this->stepFactory->createDebateStep();

            case 'QUESTIONNAIRE':
                return $this->stepFactory->createQuestionnaireStep();

            case 'CONSULTATION':
                return $this->stepFactory->createConsultationStep();

            case 'ANALYSIS':
                return $this->stepFactory->createAnalysisStep();

            case 'RESULT':
                return $this->stepFactory->createResultStep();

            case 'SELECTION':
                return $this->stepFactory->createSelectionStep();

            case 'OTHER':
                return $this->stepFactory->createOtherStep();

            default:
                throw new UserError('Please select a valid step type');
        }
    }
}
