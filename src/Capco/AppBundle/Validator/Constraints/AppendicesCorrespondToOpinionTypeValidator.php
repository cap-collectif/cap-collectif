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
        if (!($opinion instanceof \Capco\AppBundle\Entity\Opinion)) {
            throw new Exception("Validator must be used with Opinion.", 1);
        }

        $appendices = $opinion->getAppendices();

        if (empty($appendices)) {
          return;
        }

        $opinionTypeappendixTypes = $opinion->getOpinionType()->getAppendixTypes();

        $func = function(OpinionTypeAppendixType $type) {
            return $type->getAppendixType()->getId();
        };

        $opinionTypeappendixTypesIds = array_map($func, $opinionTypeappendixTypes);

        if (count($appendices) > 0) {
            foreach ($appendices as $appendix) {
                if (!in_array($appendix->getAppendixType()->getId(), $opinionTypeappendixTypesIds)) {
                    $this->context->addViolationAt('appendices', $constraint->message, [], null);
                }
            }
        }
    }
}
