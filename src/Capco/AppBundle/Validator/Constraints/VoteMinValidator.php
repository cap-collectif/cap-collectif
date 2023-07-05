<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class VoteMinValidator extends ConstraintValidator
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function validate($form, Constraint $constraint)
    {
        $max = $form->getVotesLimit();
        if ($this->toggleManager->isActive('votes_min')) {
            $min = $form->getVotesMin();
            if (null !== $min) {
                if ($min < 1) {
                    $this->context
                        ->buildViolation($constraint->messageMin1)
                        ->atPath('votesMin')
                        ->addViolation()
                    ;
                }
                if (null !== $max && $max < $min) {
                    $this->context
                        ->buildViolation($constraint->message)
                        ->atPath('votesLimit')
                        ->addViolation()
                    ;
                }
            }
        }
        if (null !== $max && $max < 1) {
            $this->context
                ->buildViolation($constraint->messageMax1)
                ->atPath('votesLimit')
                ->addViolation()
            ;
        }
    }
}
