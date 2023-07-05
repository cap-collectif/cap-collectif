<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\ProposalAnalysisComment;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ProposalAnalysisCommentVoter extends Voter
{
    public const CREATE = 'create';

    protected function supports($attribute, $subject): bool
    {
        if (
            !\in_array($attribute, [
                self::CREATE,
            ])
        ) {
            return false;
        }

        if (!$subject instanceof ProposalAnalysisComment) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token): bool
    {
        $viewer = $token->getUser();

        if (!$viewer instanceof User) {
            return false;
        }

        switch ($attribute) {
            case self::CREATE:
                return $this->canCreate($subject, $viewer);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canCreate(ProposalAnalysisComment $proposalAnalysisComment, User $viewer): bool
    {
        $proposalAnalysis = $proposalAnalysisComment->getProposalAnalysis();
        $concernedUsers = $proposalAnalysis->getConcernedUsers()->toArray();

        return \in_array($viewer, $concernedUsers);
    }
}
