<?php

namespace Capco\AppBundle\Validator\Constraints;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasUnlistedEmailValidator extends ConstraintValidator
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    public function validate($value, Constraint $constraint)
    {
        if (null === $value->getEmail()) {
            return;
        }

        $registrations = $this->entityManager
            ->getRepository('CapcoAppBundle:EventRegistration')
            ->findBy([
                'event' => $value->getEvent(),
                'email' => $value->getEmail(),
            ])
        ;

        $present = false;
        foreach ($registrations as $registration) {
            if ($registration->getId() !== $value->getId()) {
                $present = true;
            }
        }

        if ($present) {
            $this->context
                ->buildViolation($constraint->message)
                ->atPath('email')
                ->addViolation()
            ;

            return false;
        }

        return true;
    }
}
