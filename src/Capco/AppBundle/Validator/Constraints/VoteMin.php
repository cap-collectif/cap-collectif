<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class VoteMin extends Constraint
{
    public $message = 'maximum-vote-must-be-higher-than-minimum';
    public $messageMax1 = 'maximum-vote-must-be-greater-than-or-equal';
    public $messageMin1 = 'minimum-vote-must-be-greater-than-or-equal';

    public function validatedBy()
    {
        return \get_class($this) . 'Validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
