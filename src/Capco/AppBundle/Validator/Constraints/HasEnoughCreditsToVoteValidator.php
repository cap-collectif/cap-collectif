<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Resolver\ProposalStepVotesResolver;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasEnoughCreditsToVoteValidator extends ConstraintValidator
{
    public function __construct(
        private readonly ProposalStepVotesResolver $resolver
    ) {
    }

    public function validate($object, Constraint $constraint)
    {
        if (!$this->resolver->voteIsPossible($object)) {
            $this->context->buildViolation($constraint->message)->addViolation();

            return false;
        }

        return true;
    }
}
