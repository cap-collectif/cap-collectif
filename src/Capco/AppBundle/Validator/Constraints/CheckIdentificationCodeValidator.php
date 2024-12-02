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

    public function validate($id, Constraint $constraint)
    {
        $code = $this->codeRepository->findCodeUsedOrNot($id);

        if (!$code) {
            $this->context->buildViolation($constraint->message)->addViolation();
        } else {
            if (!empty($code['isUsed'])) {
                $this->context->buildViolation($constraint->messageUsed)->addViolation();
            }
        }
    }
}
