<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Project;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class ProjectVoter extends Voter
{
    public const VIEW = 'view';
    public const CREATE = 'create';
    public const EDIT = 'edit';
    public const EXPORT = 'export';

    protected function supports($attribute, $subject): bool
    {
        if ($subject instanceof Project) {
            return \in_array(
                $attribute,
                [self::VIEW, self::EDIT, self::CREATE, self::EXPORT],
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
            case self::EXPORT:
                return self::canDownloadExport($subject, $viewer);
        }

        return false;
    }

    private static function canView(Project $project, User $viewer): bool
    {
        return self::isAdminOrOwner($project, $viewer);
    }

    private static function canEdit(Project $project, User $viewer): bool
    {
        return self::isAdminOrOwner($project, $viewer);
    }

    private static function canCreate(User $viewer): bool
    {
        return $viewer->isAdmin() || $viewer->isProjectAdmin();
    }

    private static function canDownloadExport(Project $project, User $viewer): bool
    {
        return self::isAdminOrOwner($project, $viewer);
    }

    private static function isAdminOrOwner(Project $project, User $viewer): bool
    {
        return $viewer->isAdmin() || $project->getOwner() === $viewer;
    }
}
