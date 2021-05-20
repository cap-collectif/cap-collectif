<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Encoder\DebateAnonymousParticipationHashEncoder;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class CheckDebateAnonymousParticipationHashValidator extends ConstraintValidator
{
    private DebateAnonymousParticipationHashEncoder $encoder;

    public function __construct(DebateAnonymousParticipationHashEncoder $encoder)
    {
        $this->encoder = $encoder;
    }

    public function validate($value, Constraint $constraint)
    {
        if (!$constraint instanceof CheckDebateAnonymousParticipationHashConstraint) {
            throw new UnexpectedTypeException(
                $constraint,
                CheckDebateAnonymousParticipationHashConstraint::class
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
