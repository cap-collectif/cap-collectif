<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Repository\ProposalDecisionMakerRepository;
use Capco\AppBundle\Repository\ProposalDecisionRepository;
use Capco\AppBundle\Repository\ProposalSupervisorRepository;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

class ProposalAnalysisRelatedVoter extends Voter
{
    public const EVALUATE = 'EVALUATE';
    public const VIEW = 'VIEW';
    public const DECIDE = 'DECIDE';

    private $proposalSupervisorRepository;
    private $proposalDecisionMakerRepository;
    private $proposalDecisionRepository;

    public function __construct(
        ProposalSupervisorRepository $proposalSupervisorRepository,
        ProposalDecisionMakerRepository $proposalDecisionMakerRepository,
        ProposalDecisionRepository $proposalDecisionRepository
    ) {
        $this->proposalSupervisorRepository = $proposalSupervisorRepository;
        $this->proposalDecisionMakerRepository = $proposalDecisionMakerRepository;
        $this->proposalDecisionRepository = $proposalDecisionRepository;
    }

    /**
     * {@inheritdoc}
     */
    protected function supports($attribute, $subject): bool
    {
        return \in_array($attribute, [self::EVALUATE, self::DECIDE, self::VIEW], true) &&
            $subject instanceof Proposal;
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
            case self::EVALUATE:
                return $this->canEvaluate($subject, $user);
            case self::DECIDE:
                return $this->canDecide($subject, $user);
            default:
                return false;
        }
    }

    private function canSee(Proposal $subject, User $user): bool
    {
        // TODO: Check proposal's analysts assignments here.

        if (
            $this->proposalSupervisorRepository->findBy([
                'proposal' => $subject,
                'supervisor' => $user
            ])
        ) {
            return true;
        }

        if (
            $this->proposalDecisionMakerRepository->findBy([
                'proposal' => $subject,
                'decisionMaker' => $user
            ])
        ) {
            return true;
        }

        if ($user->hasRole(UserRole::ROLE_ADMIN)) {
            return true;
        }

        return false;
    }

    private function canEvaluate(Proposal $subject, User $user): bool
    {
        /** @var ProposalDecision $decision */
        $decision = $this->proposalDecisionRepository->findOneBy(['proposal' => $subject]);
        if ($decision && $decision->getIsDone()) {
            return false;
        }

        if (
            $this->proposalSupervisorRepository->findOneBy([
                'proposal' => $subject,
                'supervisor' => $user
            ])
        ) {
            return true;
        }

        if ($user->hasRole(UserRole::ROLE_ADMIN)) {
            return true;
        }

        return false;
    }

    private function canDecide(Proposal $subject, User $user): bool
    {
        if (
            $this->proposalDecisionMakerRepository->findBy([
                'proposal' => $subject,
                'decisionMaker' => $user
            ])
        ) {
            return true;
        }

        if ($user->hasRole(UserRole::ROLE_ADMIN)) {
            return true;
        }

        return false;
    }
}
