<?php

namespace Capco\AppBundle\Validator\Constraints;

use FOS\UserBundle\Model\UserManagerInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class EmailDoesNotBelongToUserValidator extends ConstraintValidator
{
    public function __construct(
        private readonly UserManagerInterface $userManager
    ) {
    }

    public function validate($value, Constraint $constraint)
    {
        if (null !== $value->getEmail()) {
            $user = $this->userManager->findUserByEmail($value->getEmail());
            if (null !== $user) {
                $this->context
                    ->buildViolation($constraint->message)
                    ->atPath('email')
                    ->addViolation()
                ;
            }
        }
    }
}
