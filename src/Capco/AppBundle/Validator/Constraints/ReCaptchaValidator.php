<?php

namespace Capco\AppBundle\Validator\Constraints;

use DS\Library\ReCaptcha\Http\Driver\DriverInterface;
use DS\Library\ReCaptcha\ReCaptcha;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\InvalidArgumentException;

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
