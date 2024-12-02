<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class ProposalVoter extends AbstractOwnerableVoter
{
    final public const CHANGE_STATUS = 'changeStatus';
    final public const CHANGE_CONTENT = 'changeContent';
    final public const EDIT = 'edit';
    final public const SELECT_PROPOSAL = 'selectProposal';
    final public const UNSELECT_PROPOSAL = 'unselectProposal';
    final public const CREATE_PROPOSAL_FUSION = 'createProposalFusion';
    final public const UPDATE_PROPOSAL_FUSION = 'updateProposalFusion';
    final public const CHANGE_PROPOSAL_NOTATION = 'changeProposalNotation';
    final public const CHANGE_PROPOSAL_PROGRESS_STEPS = 'changeProposalProgressSteps';

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

        return match ($attribute) {
            self::CHANGE_STATUS, self::EDIT, self::SELECT_PROPOSAL, self::UNSELECT_PROPOSAL, self::CHANGE_PROPOSAL_NOTATION, self::CHANGE_PROPOSAL_PROGRESS_STEPS => self::isAdminOrOwnerOrMember($subject->getProject(), $viewer),
            self::CHANGE_CONTENT => self::canChangeContent($subject, $viewer),
            self::CREATE_PROPOSAL_FUSION, self::UPDATE_PROPOSAL_FUSION => self::canFusion($subject, $viewer),
            default => false,
        };
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
            $project = $proposal->getProject();

            return self::isAdminOrOwnerOrMember($project, $viewer);
        }

        return true;
    }
}
