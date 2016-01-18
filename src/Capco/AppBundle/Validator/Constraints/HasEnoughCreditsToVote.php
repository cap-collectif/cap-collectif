<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class HasEnoughCreditsToVote extends Constraint
{
    public $message = 'proposal.vote.not_enough_credits';

    public function validatedBy()
    {
        return 'has_enough_credits.validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
