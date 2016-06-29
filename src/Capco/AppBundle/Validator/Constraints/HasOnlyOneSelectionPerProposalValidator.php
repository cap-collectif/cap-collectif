<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasOnlyOneSelectionPerProposalValidator extends ConstraintValidator
{
    public function validate($protocol, Constraint $constraint)
    {
        $proposals = $protocol->getProposalsIds();
        if ($this->hasDupes($proposals)) {
            $this->context
                ->buildViolation($constraint->message)
                ->atPath('selections')
                ->addViolation()
            ;
        }
    }

    private function hasDupes($array)
    {
        $dupe_array = [];
        foreach ($array as $val) {
            if (in_array($val, $dupe_array)) {
                return true;
            }
            $dupe_array[] = $val;
        }

        return false;
    }
}
