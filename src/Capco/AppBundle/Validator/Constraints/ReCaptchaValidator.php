<?php

namespace Capco\AppBundle\Validator\Constraints;

use ReCaptcha\ReCaptcha;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class ReCaptchaValidator extends ConstraintValidator
{
    protected $request;
    protected $recaptcha;
    protected $enabled;

    public function __construct(RequestStack $requestStack, string $privateKey, $enabled = true)
    {
        $this->request = $requestStack->getCurrentRequest();
        $this->recaptcha = new ReCaptcha($privateKey);
        $this->enabled = $enabled;
    }

    public function validate($value, Constraint $constraint)
    {
        if ($this->enabled && !$this->recaptcha->verify($value, $this->request->getClientIp())->isSuccess()) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
