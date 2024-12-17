<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Repository\Security\UserIdentificationCodeRepository;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CheckIdentificationCodeValidator extends ConstraintValidator
{
    public function __construct(private readonly UserIdentificationCodeRepository $codeRepository)
    {
    }

    public function validate($userIdentificationCode, Constraint $constraint)
    {
        if (!$userIdentificationCode) {
            return;
        }

        $code = $this->codeRepository->findCodeUsedOrNot($userIdentificationCode->getIdentificationCode());

        if (!$code) {
            $this->context->buildViolation($constraint->message)->addViolation();

            return;
        }

        if (!empty($code['isUsed'])) {
            $this->context->buildViolation($constraint->messageUsed)->addViolation();
        }
    }
}
