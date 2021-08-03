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

    protected function supports($attribute, $subject): bool
    {
        if ($subject instanceof Project) {
            return \in_array($attribute, [self::VIEW, self::EDIT, self::CREATE], true);
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
                return $this->canView($subject, $viewer);
            case self::EDIT:
                return $this->canEdit($subject, $viewer);
            case self::CREATE:
                return $this->canCreate($subject, $viewer);
        }

        return false;
    }

    private function canView(Project $project, User $viewer): bool
    {
        if ($viewer->isAdmin()) {
            return true;
        }
        if ($viewer->isProjectAdmin() && $project->getOwner() === $viewer) {
            return true;
        }

        return false;
    }

    private function canEdit(Project $project, User $viewer): bool
    {
        return $this->canView($project, $viewer);
    }

    private function canCreate(Project $project, User $viewer): bool
    {
        return $viewer->isAdmin() || $viewer->isProjectAdmin();
    }
}
