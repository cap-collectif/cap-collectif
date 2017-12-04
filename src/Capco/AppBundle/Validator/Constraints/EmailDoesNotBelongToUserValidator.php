<?php

namespace Capco\AppBundle\Validator\Constraints;

use Sonata\UserBundle\Entity\UserManager;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class EmailDoesNotBelongToUserValidator extends ConstraintValidator
{
    private $userManager;

    public function __construct(UserManager $userManager)
    {
        $this->userManager = $userManager;
    }

    public function validate($value, Constraint $constraint)
    {
        if (null !== $value->getEmail()) {
            $user = $this->userManager->findUserByEmail($value->getEmail());
            if (null !== $user) {
                $this->context->buildViolation($constraint->message)
                    ->atPath('email')
                    ->addViolation();
            }
        }
    }
}
