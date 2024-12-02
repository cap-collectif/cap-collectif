<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Project;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class ProjectVoter extends AbstractOwnerableVoter
{
    final public const VIEW = 'view';
    final public const CREATE = 'create';
    final public const EDIT = 'edit';
    final public const DELETE = 'delete';
    final public const EXPORT = 'export';
    final public const CREATE_PROPOSAL_FROM_BO = 'createProposalFromBo';
    final public const DUPLICATE = 'duplicate';

    protected function supports($attribute, $subject): bool
    {
        if ($subject instanceof Project) {
            return \in_array(
                $attribute,
                [
                    self::VIEW,
                    self::EDIT,
                    self::CREATE,
                    self::DELETE,
                    self::EXPORT,
                    self::CREATE_PROPOSAL_FROM_BO,
                    self::DUPLICATE,
                ],
                true
            );
        }

        return false;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token): bool
    {
        $viewer = $token->getUser();

        if (!$viewer instanceof User) {
            return false;
        }

        return match ($attribute) {
            self::VIEW => self::canView($subject, $viewer),
            self::EDIT => self::canEdit($subject, $viewer),
            self::CREATE => self::canCreate($viewer),
            self::DELETE => self::canDelete($subject, $viewer),
            self::EXPORT => self::canDownloadExport($subject, $viewer),
            self::CREATE_PROPOSAL_FROM_BO => self::canCreateProposalFromBo($subject, $viewer),
            self::DUPLICATE => self::canDuplicate($subject, $viewer),
            default => false,
        };
    }

    private static function canDownloadExport(Project $project, User $viewer): bool
    {
        return self::isAdminOrOwnerOrMember($project, $viewer);
    }

    private static function canCreateProposalFromBo(Project $project, User $viewer): bool
    {
        return self::isAdminOrOwnerOrMember($project, $viewer);
    }

    private static function canDuplicate(Project $project, User $viewer): bool
    {
        return self::isAdminOrOwnerOrMember($project, $viewer);
    }
}
