<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AddStepService
{
    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function addStep(Argument $input, User $viewer): array
    {
        $projectId = $input->offsetGet('projectId');
        $title = $input->offsetGet('title');
        $stepType = $input->offsetGet('stepType');

        $project = $this->getProject($projectId, $viewer);
        $stepsCount = $project->getSteps()->count();

        $step = $this->createStepObject($stepType)->setTitle($title);
        $projectAbstractStep = (new ProjectAbstractStep())->setProject($project)->setStep($step)->setPosition($stepsCount + 1);
        $project->addStep($projectAbstractStep);
        $step->setProjectAbstractStep($projectAbstractStep);

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

    private function createStepObject(string $stepType): AbstractStep
    {
        switch ($stepType) {
            case 'COLLECT':
                return new CollectStep();

            case 'SELECTION':
                return new SelectionStep();

            case 'DEBATE':
                $debate = new Debate();

                return new DebateStep($debate);

            case 'QUESTIONNAIRE':
                return new QuestionnaireStep();

            case 'CONSULTATION':
                return new ConsultationStep();

            case 'OTHER':
                return new OtherStep();

            default:
                throw new UserError('Please select a valid step type');
        }
    }

    private function getProject($projectId, User $viewer): Project
    {
        $project = $this->globalIdResolver->resolve($projectId, $viewer);

        if (!$project instanceof Project) {
            throw new UserError("Project with id {$projectId} was not found.");
        }

        return $project;
    }
}
