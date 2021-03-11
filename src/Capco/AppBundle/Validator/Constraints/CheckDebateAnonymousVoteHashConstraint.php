<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class CheckDebateAnonymousVoteHashConstraint extends Constraint
{
    public $message = 'invalid-debate-anonymous-hash';

    public function validatedBy()
    {
        return CheckDebateAnonymousVoteHashValidator::class;
    }
}
