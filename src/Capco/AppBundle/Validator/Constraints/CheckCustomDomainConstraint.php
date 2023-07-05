<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\GraphQL\Mutation\UpdateCustomDomainMutation;
use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class CheckCustomDomainConstraint extends Constraint
{
    public $cnameNotValid = UpdateCustomDomainMutation::CNAME_NOT_VALID;
    public $syntaxNotValid = UpdateCustomDomainMutation::CUSTOM_DOMAIN_SYNTAX_NOT_VALID;

    public function validatedBy(): string
    {
        return CheckCustomDomainValidator::class;
    }
}
