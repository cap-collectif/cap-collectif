<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

class ProposalAnalysisRelatedVoter extends Voter
{
    public const ANALYSE = 'ANALYSE';
    public const EVALUATE = 'EVALUATE';
    public const VIEW = 'VIEW';
    public const REVISE = 'REVISE';
    public const DECIDE = 'DECIDE';
    public const ASSIGN_SUPERVISOR = 'ASSIGN_SUPERVISOR';
    public const ASSIGN_ANALYST = 'ASSIGN_ANALYST';
    public const ASSIGN_DECISION_MAKER = 'ASSIGN_DECISION_MAKER';

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

        switch ($attribute) {
            case self::VIEW:
            case self::REVISE:
                return $this->canSee($subject, $viewer);
            case self::ANALYSE:
                return $this->canAnalyse($subject, $viewer);
            case self::EVALUATE:
                return $this->canEvaluate($subject, $viewer);
            case self::DECIDE:
                return $this->canDecide($subject, $viewer);
            case self::ASSIGN_SUPERVISOR:
                return $this->canAssignSupervisor($subject, $viewer);
            case self::ASSIGN_DECISION_MAKER:
                return $this->canAssignDecisionMaker($subject, $viewer);
            case self::ASSIGN_ANALYST:
                return $this->canAssignAnalyst($subject, $viewer);
            default:
                return false;
        }
    }

    private function canSee(Proposal $subject, User $viewer): bool
    {
        return $this->viewerIsAdminOrOwner($subject, $viewer) ||
            $subject->getDecisionMaker() === $viewer ||
            $subject->getSupervisor() === $viewer ||
            $subject->getAnalysts()->contains($viewer);
    }

    private function canAnalyse(Proposal $subject, User $viewer): bool
    {
        return $subject->getAnalysts()->contains($viewer);
    }

    private function canEvaluate(Proposal $subject, User $viewer): bool
    {
        if (
            ($decision = $subject->getDecision()) &&
            ProposalStatementState::DONE === $decision->getState()
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
        return $this->viewerIsAdminOrOwner($subject, $viewer) ||
            $subject->getDecisionMaker() === $viewer;
    }

    private function canAssignDecisionMaker(Proposal $subject, User $viewer): bool
    {
        return $this->viewerIsAdminOrOwner($subject, $viewer);
    }

    private function canAssignAnalyst(Proposal $subject, User $viewer): bool
    {
        if (
            $this->viewerIsAdminOrOwner($subject, $viewer) ||
            $subject->getDecisionMaker() === $viewer ||
            $subject->getSupervisor() === $viewer
        ) {
            return true;
        }

        return $this->canAnalyse($subject, $viewer);
    }

    private function viewerIsAdminOrOwner(Proposal $subject, User $viewer): bool
    {
        return $viewer->isAdmin() || $subject->getProjectOwner() === $viewer;
    }
}
