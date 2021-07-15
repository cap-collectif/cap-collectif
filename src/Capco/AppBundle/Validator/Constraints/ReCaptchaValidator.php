<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Toggle\Manager;
use ReCaptcha\ReCaptcha;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Capco\AppBundle\Utils\IPGuesser;

class ReCaptchaValidator extends ConstraintValidator
{
    protected RequestStack $requestStack;
    protected ReCaptcha $recaptcha;
    protected Manager $toggle;

    // used to disable in functional testing
    protected bool $enabled;

    public function __construct(RequestStack $requestStack, string $privateKey, Manager $toggle, bool $enabled = true)
    {
        $this->requestStack = $requestStack;
        $this->recaptcha = new ReCaptcha($privateKey);
        $this->toggle = $toggle;
        $this->enabled = $enabled;
    }

    public function validate($value, Constraint $constraint)
    {
        $request = $this->requestStack->getCurrentRequest();
        $ip = IPGuesser::getClientIp($request);

        if ($this->enabled && $this->toggle->isActive('captcha') && !$this->recaptcha->verify($value, $ip)->isSuccess()) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
