<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasUserGroupIdVisibilityGroup extends Constraint
{
    public $noGroupMessage = 'global.no_group_when_mandatory';
    public $groupButNotCustom = 'global.no_group_when_not_custom';

    public function validatedBy(): string
    {
        return HasUserGroupIfVisibilityGroupValidator::class;
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
