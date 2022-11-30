<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class ProposalVoter extends AbstractOwnerableVoter
{
    public const CHANGE_STATUS = 'changeStatus';
    public const CHANGE_CONTENT = 'changeContent';
    public const EDIT = 'edit';
    public const SELECT_PROPOSAL = 'selectProposal';
    public const UNSELECT_PROPOSAL = 'unselectProposal';
    public const CREATE_PROPOSAL_FUSION = 'createProposalFusion';
    public const UPDATE_PROPOSAL_FUSION = 'updateProposalFusion';
    public const CHANGE_PROPOSAL_NOTATION = 'changeProposalNotation';
    public const CHANGE_PROPOSAL_PROGRESS_STEPS = 'changeProposalProgressSteps';

    protected function supports($attribute, $subject)
    {
        if (
            !\in_array($attribute, [
                self::CHANGE_STATUS,
                self::CHANGE_CONTENT,
                self::EDIT,
                self::SELECT_PROPOSAL,
                self::UNSELECT_PROPOSAL,
                self::CREATE_PROPOSAL_FUSION,
                self::UPDATE_PROPOSAL_FUSION,
                self::CHANGE_PROPOSAL_NOTATION,
                self::CHANGE_PROPOSAL_PROGRESS_STEPS,
            ])
        ) {
            return false;
        }

        if (\in_array($attribute, [self::CREATE_PROPOSAL_FUSION, self::UPDATE_PROPOSAL_FUSION])) {
            return true;
        }

        if (!$subject instanceof Proposal) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token)
    {
        $viewer = $token->getUser();

        if (!$viewer instanceof User) {
            return false;
        }
        switch ($attribute) {
            case self::CHANGE_STATUS:
            case self::EDIT:
            case self::SELECT_PROPOSAL:
            case self::UNSELECT_PROPOSAL:
            case self::CHANGE_PROPOSAL_NOTATION:
            case self::CHANGE_PROPOSAL_PROGRESS_STEPS:
                return self::isAdminOrOwnerOrMember($subject->getProject(), $viewer);
            case self::CHANGE_CONTENT:
                return self::canChangeContent($subject, $viewer);
            case self::CREATE_PROPOSAL_FUSION:
            case self::UPDATE_PROPOSAL_FUSION:
                return self::canFusion($subject, $viewer);
            default:
                return false;
        }
    }

    private static function canChangeContent(Proposal $proposal, User $viewer): bool
    {
        if (self::isAdminOrOwnerOrMember($proposal->getProject(), $viewer)) {
            return true;
        }

        return $proposal->viewerCanUpdate($viewer) && $proposal->canContribute($viewer);
    }

    private static function canFusion(array $proposals, User $viewer): bool
    {
        foreach ($proposals as $proposal) {
            if (!$proposal->viewerIsAdminOrOwner($viewer)) {
                return false;
            }
        }

        return true;
    }
}
