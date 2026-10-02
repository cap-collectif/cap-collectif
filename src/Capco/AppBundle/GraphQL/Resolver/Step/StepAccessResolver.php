<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\AppBundle\Service\HubDocumentsStepGuard;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class StepAccessResolver
{
    public function __construct(
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly HubDocumentsStepGuard $hubDocumentsStepGuard
    ) {
    }

    public function canEdit(AbstractStep $step, ?User $viewer = null): bool
    {
        return null !== $viewer
            && $this->authorizationChecker->isGranted(ProjectVoter::EDIT, $step->getProject());
    }

    public function canDelete(AbstractStep $step, ?User $viewer = null): bool
    {
        if (null === $viewer || $this->hubDocumentsStepGuard->isProtectedDocumentsStep($step)) {
            return false;
        }

        if ($step instanceof CollectStep && !$viewer->isSuperAdmin()) {
            foreach ($step->getProject()?->getRealSteps() ?? [] as $projectStep) {
                if ($projectStep instanceof SelectionStep) {
                    return false;
                }
            }
        }

        return $this->authorizationChecker->isGranted(ProjectVoter::DELETE, $step->getProject());
    }
}
