<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Security;

class StepVoter extends AbstractOwnerableVoter
{
    final public const VIEW = 'view';

    public function __construct(private readonly Security $security)
    {
    }

    public static function view(AbstractStep $step, ?User $viewer = null): bool
    {
        $project = $step->getProject();

        if (!$viewer && $project->isPublic() && $step->getIsEnabled()) {
            return true;
        }

        if ($viewer && self::isAdminOrOwnerOrMember($project, $viewer)) {
            return true;
        }

        if (!$step->getIsEnabled()) {
            return false;
        }

        if ($project->isPublic()) {
            return true;
        }

        if (!$viewer) {
            return false;
        }

        if (ProjectVisibilityMode::VISIBILITY_CUSTOM === $project->getVisibility()) {
            $viewerGroups = $viewer->getUserGroups()->toArray();
            $allowedGroups = $project->getRestrictedViewerGroups()->toArray();
            foreach ($viewerGroups as $userGroup) {
                if (\in_array($userGroup->getGroup(), $allowedGroups)) {
                    return true;
                }
            }
        }

        $viewerVisibility = $project->getVisibilityForViewer($viewer);

        return \in_array($project->getVisibility(), $viewerVisibility)
            && $project->getVisibility() < ProjectVisibilityMode::VISIBILITY_CUSTOM;
    }

    /**
     * @param string $attribute
     * @param mixed  $subject
     */
    protected function supports($attribute, $subject): bool
    {
        if (
            !\in_array($attribute, [
                self::VIEW,
            ])
        ) {
            return false;
        }
        if (!$subject instanceof AbstractStep) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token): bool
    {
        $viewer = $this->security->getUser();

        if (!$viewer instanceof User && null !== $viewer) {
            return false;
        }

        /** @var AbstractStep $step */
        $step = $subject;

        return match ($attribute) {
            self::VIEW => $this->view($step, $viewer),
            default => false,
        };
    }
}
