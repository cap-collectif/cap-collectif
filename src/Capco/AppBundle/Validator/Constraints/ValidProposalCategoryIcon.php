<?php

namespace Capco\AppBundle\Validator\Constraints;
use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class ValidProposalCategoryIcon extends Constraint
{
    public $message = 'icon-not-valid';

    public function validatedBy()
    {
        return ValidProposalCategoryIconValidator::class;
    }
}
