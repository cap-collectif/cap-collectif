<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Repository\ProposalAnalystRepository;
use Capco\AppBundle\Repository\ProposalDecisionMakerRepository;
use Capco\AppBundle\Repository\ProposalSupervisorRepository;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

class ProposalAnalysisRelatedVoter extends Voter
{
    public const ANALYSE = 'ANALYSE';
    public const EVALUATE = 'EVALUATE';
    public const VIEW = 'VIEW';
    public const DECIDE = 'DECIDE';
    public const ASSIGN_SUPERVISOR = 'ASSIGN_SUPERVISOR';

    private $proposalSupervisorRepository;
    private $proposalDecisionMakerRepository;
    private $proposalAnalystRepository;
    private $authorizationChecker;

    public function __construct(
        ProposalSupervisorRepository $proposalSupervisorRepository,
        ProposalDecisionMakerRepository $proposalDecisionMakerRepository,
        ProposalAnalystRepository $proposalAnalystRepository,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->proposalSupervisorRepository = $proposalSupervisorRepository;
        $this->proposalDecisionMakerRepository = $proposalDecisionMakerRepository;
        $this->proposalAnalystRepository = $proposalAnalystRepository;
        $this->authorizationChecker = $authorizationChecker;
    }

    /**
     * {@inheritdoc}
     */
    protected function supports($attribute, $subject): bool
    {
        return \in_array(
            $attribute,
            [self::EVALUATE, self::DECIDE, self::VIEW, self::ANALYSE, self::ASSIGN_SUPERVISOR],
            true
        ) && $subject instanceof Proposal;
    }

    /**
     * {@inheritdoc}
     */
    protected function voteOnAttribute($attribute, $subject, TokenInterface $token): bool
    {
        /** @var User $user */
        $user = $token->getUser();

        if (!$user instanceof UserInterface) {
            return false;
        }

        switch ($attribute) {
            case self::VIEW:
                return $this->canSee($subject, $user);
            case self::ANALYSE:
                return $this->canAnalyse($subject, $user);
            case self::EVALUATE:
                return $this->canEvaluate($subject, $user);
            case self::DECIDE:
                return $this->canDecide($subject, $user);
            case self::ASSIGN_SUPERVISOR:
                return $this->canAssign($subject, $user);
            default:
                return false;
        }
    }

    private function canSee(Proposal $subject, User $user): bool
    {
        if (
            $this->proposalDecisionMakerRepository->findBy([
                'proposal' => $subject,
                'decisionMaker' => $user,
            ])
        ) {
            return true;
        }

        if (
            $this->proposalSupervisorRepository->findBy([
                'proposal' => $subject,
                'supervisor' => $user,
            ])
        ) {
            return true;
        }

        if (
            $this->proposalAnalystRepository->findBy([
                'proposal' => $subject,
                'analyst' => $user,
            ])
        ) {
            return true;
        }

        return $this->authorizationChecker->isGranted(UserRole::ROLE_ADMIN);
    }

    private function canAnalyse(Proposal $subject, User $user): bool
    {
        if (
            $this->proposalAnalystRepository->findOneBy([
                'proposal' => $subject,
                'analyst' => $user,
            ])
        ) {
            return true;
        }

        if (
            $this->proposalSupervisorRepository->findOneBy([
                'proposal' => $subject,
                'supervisor' => $user,
            ])
        ) {
            return true;
        }

        return $this->authorizationChecker->isGranted(UserRole::ROLE_ADMIN);
    }

    private function canEvaluate(Proposal $subject, User $user): bool
    {
        if (
            ($decision = $subject->getDecision()) &&
            ProposalStatementState::DONE === $decision->getState()
        ) {
            return false;
        }

        if (
            $this->proposalSupervisorRepository->findOneBy([
                'proposal' => $subject,
                'supervisor' => $user,
            ])
        ) {
            return true;
        }

        return $this->authorizationChecker->isGranted(UserRole::ROLE_ADMIN);
    }

    private function canDecide(Proposal $subject, User $user): bool
    {
        if (
            $this->proposalDecisionMakerRepository->findBy([
                'proposal' => $subject,
                'decisionMaker' => $user,
            ])
        ) {
            return true;
        }

        return $this->authorizationChecker->isGranted(UserRole::ROLE_ADMIN);
    }

    private function canAssign(Proposal $subject, User $user): bool
    {
        return $this->canDecide($subject, $user);
    }
}
