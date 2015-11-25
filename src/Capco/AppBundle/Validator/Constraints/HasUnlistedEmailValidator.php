<?php

namespace Capco\AppBundle\Validator\Constraints;

use Doctrine\ORM\EntityManager;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasUnlistedEmailValidator extends ConstraintValidator
{
    private $entityManager;

    public function __construct(EntityManager $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function validate($value, Constraint $constraint)
    {
        if ($value->getEmail() == null) {
            return;
        }

        $registrations = $this->entityManager->getRepository('CapcoAppBundle:EventRegistration')->findBy([
            'event' => $value->getEvent(),
            'email' => $value->getEmail(),
        ]);

        $present = false;
        foreach ($registrations as $registration) {
            if ($registration->getId() != $value->getId()) {
                $present = true;
            }
        }

        if ($present) {
            $this->context->addViolationAt('email', $constraint->message, [], null);

            return false;
        }

        return true;
    }
}
