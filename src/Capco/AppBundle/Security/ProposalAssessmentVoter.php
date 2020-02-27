<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\ProposalSupervisorRepository;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

class ProposalAssessmentVoter extends Voter
{
    public const EVALUATE = 'EVALUATE';

    private $proposalSupervisorRepository;

    public function __construct(ProposalSupervisorRepository $proposalSupervisorRepository)
    {
        $this->proposalSupervisorRepository = $proposalSupervisorRepository;
    }

    /**
     * {@inheritdoc}
     */
    protected function supports($attribute, $subject): bool
    {
        return \in_array($attribute, [self::EVALUATE], true) && $subject instanceof Proposal;
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
            case self::EVALUATE:
                return $this->canEvaluate($subject, $user);
            default:
                return false;
        }
    }

    private function canEvaluate($subject, User $user): bool
    {
        if (
            $this->proposalSupervisorRepository->findOneBy([
                'proposal' => $subject,
                'supervisor' => $user
            ])
        ) {
            return true;
        }

        return false;
    }
}
