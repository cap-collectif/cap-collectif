<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class ProposalAnalysisRelatedVoter extends AbstractOwnerableVoter
{
    final public const ANALYSE = 'ANALYSE';
    final public const EVALUATE = 'EVALUATE';
    final public const VIEW = 'VIEW';
    final public const REVISE = 'REVISE';
    final public const DECIDE = 'DECIDE';
    final public const ASSIGN_SUPERVISOR = 'ASSIGN_SUPERVISOR';
    final public const ASSIGN_ANALYST = 'ASSIGN_ANALYST';
    final public const ASSIGN_DECISION_MAKER = 'ASSIGN_DECISION_MAKER';

    /**
     * {@inheritdoc}
     */
    protected function supports($attribute, $subject): bool
    {
        return \in_array(
            $attribute,
            [
                self::EVALUATE,
                self::DECIDE,
                self::VIEW,
                self::REVISE,
                self::ANALYSE,
                self::ASSIGN_SUPERVISOR,
                self::ASSIGN_ANALYST,
                self::ASSIGN_DECISION_MAKER,
            ],
            true
        ) && $subject instanceof Proposal;
    }

    /**
     * {@inheritdoc}
     */
    protected function voteOnAttribute($attribute, $subject, TokenInterface $token): bool
    {
        /** @var User $viewer */
        $viewer = $token->getUser();

        if (!$viewer instanceof UserInterface) {
            return false;
        }

        return match ($attribute) {
            self::VIEW, self::REVISE => $this->canSee($subject, $viewer),
            self::ANALYSE => $this->canAnalyse($subject, $viewer),
            self::EVALUATE => $this->canEvaluate($subject, $viewer),
            self::DECIDE => $this->canDecide($subject, $viewer),
            self::ASSIGN_SUPERVISOR => $this->canAssignSupervisor($subject, $viewer),
            self::ASSIGN_DECISION_MAKER => $this->canAssignDecisionMaker($subject, $viewer),
            self::ASSIGN_ANALYST => $this->canAssignAnalyst($subject, $viewer),
            default => false,
        };
    }

    private function canSee(Proposal $subject, User $viewer): bool
    {
        return self::isAdminOrOwnerOrMember($subject->getProject(), $viewer)
            || $subject->getDecisionMaker() === $viewer
            || $subject->getSupervisor() === $viewer
            || $subject->getAnalysts()->contains($viewer);
    }

    private function canAnalyse(Proposal $subject, User $viewer): bool
    {
        return $subject->getAnalysts()->contains($viewer);
    }

    private function canEvaluate(Proposal $subject, User $viewer): bool
    {
        if (
            ($decision = $subject->getDecision())
            && ProposalStatementState::DONE === $decision->getState()
        ) {
            return false;
        }

        return $subject->getSupervisor() === $viewer;
    }

    private function canDecide(Proposal $subject, User $viewer): bool
    {
        return $subject->getDecisionMaker() === $viewer;
    }

    private function canAssignSupervisor(Proposal $subject, User $viewer): bool
    {
        return self::isAdminOrOwnerOrMember($subject->getProject(), $viewer)
            || $subject->getDecisionMaker() === $viewer;
    }

    private function canAssignDecisionMaker(Proposal $subject, User $viewer): bool
    {
        return self::isAdminOrOwnerOrMember($subject->getProject(), $viewer);
    }

    private function canAssignAnalyst(Proposal $subject, User $viewer): bool
    {
        if (
            self::isAdminOrOwnerOrMember($subject->getProject(), $viewer)
            || $subject->getDecisionMaker() === $viewer
            || $subject->getSupervisor() === $viewer
        ) {
            return true;
        }

        return $this->canAnalyse($subject, $viewer);
    }
}
