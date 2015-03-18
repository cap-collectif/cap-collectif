<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class DidNotAlreadyVoteEmail extends Constraint
{
    public $message = 'idea.vote.already';

    public function validatedBy()
    {
        return 'already_vote.validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
