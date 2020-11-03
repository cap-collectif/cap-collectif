<?php

namespace Capco\AppBundle\Validator\Constraints;
use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class ValidProposalCategoryColor extends Constraint
{
    public $message = 'color-not-valid';

    public function validatedBy()
    {
        return ValidProposalCategoryColorValidator::class;
    }
}
