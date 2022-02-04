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
        if (!$value) return;
        $this->validateMobileNumberFormat($value, $constraint);
        $this->checkAlreadyUsed($value, $constraint);
    }

    private function validateMobileNumberFormat(string $phone, Constraint $constraint)
    {
        $validMobileNumbers = ['+336', '+337'];
        $numbersToCheck = substr($phone, 0, 4);
        if (!in_array($numbersToCheck, $validMobileNumbers)) {
            $this->context->buildViolation($constraint->mobileNumberMessage)->addViolation();
        }

        $phoneMaxLength = 12; // +33 and 9 digits
        if (strlen($phone) !== $phoneMaxLength) {
            $this->context->buildViolation($constraint->invalidLength)->addViolation();
        }
    }

    private function checkAlreadyUsed(string $phone, Constraint $constraint)
    {
        $currentUser = $this->security->getUser();
        $user = $this->userRepository->findOneBy(['phone' => $phone]);
        if ($user && $user !== $currentUser) {
            $this->context->buildViolation($constraint->alreadyUsedMessage)->addViolation();
        }
    }
}
