<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class ReCaptchaValidator extends ConstraintValidator
{
    protected $request;
    protected $recaptcha;

    public function __construct(RequestStack $requestStack, string $privateKey)
    {
        $this->request = $requestStack->getCurrentRequest();
        $this->recaptcha = new \ReCaptcha\ReCaptcha($privateKey);
    }

    public function validate($value, Constraint $constraint)
    {
        if (!$this->recaptcha->verify($value, $this->request->getClientIp())->isSuccess()) {
           $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
