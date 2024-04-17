<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Project;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class ProjectVoter extends AbstractOwnerableVoter
{
    public const VIEW = 'view';
    public const CREATE = 'create';
    public const EDIT = 'edit';
    public const DELETE = 'delete';
    public const EXPORT = 'export';
    public const CREATE_PROPOSAL_FROM_BO = 'createProposalFromBo';
    public const DUPLICATE = 'duplicate';

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

        switch ($attribute) {
            case self::VIEW:
                return self::canView($subject, $viewer);

            case self::EDIT:
                return self::canEdit($subject, $viewer);

            case self::CREATE:
                return self::canCreate($viewer);

            case self::DELETE:
                return self::canDelete($subject, $viewer);

            case self::EXPORT:
                return self::canDownloadExport($subject, $viewer);

            case self::CREATE_PROPOSAL_FROM_BO:
                return self::canCreateProposalFromBo($subject, $viewer);

            case self::DUPLICATE:
                return self::canDuplicate($subject, $viewer);
        }

        return false;
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
