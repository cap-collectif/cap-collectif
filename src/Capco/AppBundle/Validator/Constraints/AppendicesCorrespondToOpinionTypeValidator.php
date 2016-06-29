<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionTypeAppendixType;

class AppendicesCorrespondToOpinionTypeValidator extends ConstraintValidator
{
    public function validate($opinion, Constraint $constraint)
    {
        $appendices = $opinion->getAppendices();
        if ($appendices->isEmpty()) {
          return;
        }

        $opinionType = $opinion->getOpinionType();
        $opinionTypeappendixTypes = $opinionType->getAppendixTypes();
        $opinionTypeappendixTypesIds = $opinionTypeappendixTypes->map(function ($otat) {
            return $otat->getAppendixType()->getId();
        });

        if ($appendices->count() > 0) {
            foreach ($appendices as $appendix) {
                $at = $appendix->getAppendixType();
                if (!$at || !$opinionTypeappendixTypesIds->contains($at->getId())) {
                    $this->context->addViolationAt('appendices', $constraint->message);
                    return;
                }
            }
        }
    }
}
