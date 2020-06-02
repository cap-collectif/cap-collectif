<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasUserGroupIfVisibilityGroupValidator extends ConstraintValidator
{
    public function validate($project, Constraint $constraint)
    {
        $visibility = $project->getVisibility();
        $groups = $project->getRestrictedViewerGroups();

        if (
            ProjectVisibilityMode::VISIBILITY_CUSTOM === $visibility &&
            (!$groups || 0 === \count($groups))
        ) {
            $this->context->buildViolation($constraint->noGroupMessage)->addViolation();
        }
        if (
            ProjectVisibilityMode::VISIBILITY_CUSTOM !== $visibility &&
            ($groups && \count($groups) > 0)
        ) {
            $this->context->buildViolation($constraint->groupButNotCustom)->addViolation();
        }
    }
}
