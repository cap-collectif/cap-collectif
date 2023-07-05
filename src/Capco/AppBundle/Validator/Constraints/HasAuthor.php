<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasAuthor extends Constraint
{
    public $message = 'must_have_user_or_organization_as_author';

    public function validatedBy()
    {
        return static::class . 'Validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
