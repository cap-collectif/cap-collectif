<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CheckPhoneNumberValidator extends ConstraintValidator
{
    private UserRepository $userRepository;
    private Security $security;

    public function __construct(UserRepository $userRepository, Security $security)
    {
        $this->userRepository = $userRepository;
        $this->security = $security;
    }

    public function validate($value, Constraint $constraint)
    {
        if (!$value) {
            return;
        }
        $this->validateNumberLength($value, $constraint);
        $this->checkAlreadyUsed($value, $constraint);
    }

    private function validateNumberLength(string $phone, Constraint $constraint)
    {
        $phoneMaxLength = 12; // +33 and 9 digits
        if (\strlen($phone) !== $phoneMaxLength) {
            $this->context->buildViolation($constraint->invalidLength)->addViolation();
        }
    }

    private function checkAlreadyUsed(string $phone, Constraint $constraint)
    {
        $currentUser = $this->security->getUser();
        $user = $this->userRepository->findOneBy(['phone' => $phone, 'phoneConfirmed' => true]);

        // when current user is unauthenticated only check if there is an existing user with this number
        if (!$currentUser && $user) {
            $this->context->buildViolation($constraint->alreadyUsedMessage)->addViolation();
        }

        if (($user && $currentUser) && $user !== $currentUser) {
            $this->context->buildViolation($constraint->alreadyUsedMessage)->addViolation();
        }
    }
}
