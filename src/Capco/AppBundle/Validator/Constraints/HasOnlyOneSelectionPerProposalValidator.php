<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasOnlyOneSelectionPerProposalValidator extends ConstraintValidator
{
    public function validate($protocol, Constraint $constraint)
    {
        $proposals = $protocol->getProposalsIds();
        if ($this->has_dupes($proposals)) {
            $this->context
                ->buildViolation($constraint->message)
                ->atPath('selections')
                ->addViolation()
            ;
        }
    }

    private function has_dupes($array){
        $dupe_array = array();
        foreach( $array as $val) {
            if (in_array($val, $dupe_array)) {
                return true;
            }
            $dupe_array[] = $val;
        }
        return false;
    }
}
