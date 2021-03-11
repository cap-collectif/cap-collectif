<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Encoder\DebateAnonymousVoteHashEncoder;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class CheckDebateAnonymousVoteHashValidator extends ConstraintValidator
{
    private DebateAnonymousVoteHashEncoder $encoder;

    public function __construct(DebateAnonymousVoteHashEncoder $encoder)
    {
        $this->encoder = $encoder;
    }

    public function validate($value, Constraint $constraint)
    {
        if (!$constraint instanceof CheckDebateAnonymousVoteHashConstraint) {
            throw new UnexpectedTypeException(
                $constraint,
                CheckDebateAnonymousVoteHashConstraint::class
            );
        }

        if (!\is_string($value)) {
            throw new UnexpectedValueException($value, 'string');
        }

        if (empty($value)) {
            $this->buildViolation($constraint);
        }

        try {
            $decoded = $this->encoder->decode($value);
            if (!\is_string($decoded->getToken()) || empty($decoded->getToken())) {
                $this->buildViolation($constraint);
            }
        } catch (\Exception $exception) {
            $this->buildViolation($constraint);
        }
    }

    private function buildViolation(Constraint $constraint)
    {
        $this->context->buildViolation($constraint->message)->addViolation();
    }
}
