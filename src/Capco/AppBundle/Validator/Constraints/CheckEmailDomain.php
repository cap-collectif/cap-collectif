<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class CheckEmailDomain extends Constraint
{
    public $message = 'check_email.domain';

    public function validatedBy()
    {
        return CheckEmailDomainValidator::class;
    }
}
