<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteStepMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly GlobalIdResolver $globalIdResolver, private readonly EntityManagerInterface $em, private readonly AuthorizationCheckerInterface $authorizationChecker)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $stepId = $input->offsetGet('stepId');
        $deleteRelatedResource = $input->offsetGet('deleteRelatedResource');
        $step = $this->getStep($stepId, $viewer);

        if ($deleteRelatedResource) {
            $this->deleteResource($step);
        }

        $this->em->remove($step);
        $this->em->flush();

        return ['stepId' => $stepId];
    }

    public function isGranted(string $stepId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }
        $step = $this->getStep($stepId, $viewer);
        $project = $step->getProject();

        return $this->authorizationChecker->isGranted(ProjectVoter::DELETE, $project);
    }

    private function getStep(string $stepId, User $viewer): AbstractStep
    {
        $step = $this->globalIdResolver->resolve($stepId, $viewer);
        if (!$step instanceof AbstractStep) {
            throw new UserError('Given step is not of type AbstractStep');
        }

        return $step;
    }

    private function deleteResource(AbstractStep $step): void
    {
        if ($step instanceof CollectStep) {
            $this->em->remove($step->getProposalForm());

            return;
        }

        if ($step instanceof SelectionStep) {
            $this->em->remove($step->getProposalForm());

            return;
        }

        if ($step instanceof QuestionnaireStep) {
            $this->em->remove($step->getQuestionnaire());

            return;
        }

        if ($step instanceof ConsultationStep) {
            foreach ($step->getConsultations() as $consultation) {
                $this->em->remove($consultation);
            }

            return;
        }

        if ($step instanceof DebateStep) {
            $this->em->remove($step->getDebate());
        }
    }
}
