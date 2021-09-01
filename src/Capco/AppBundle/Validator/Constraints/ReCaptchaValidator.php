<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Toggle\Manager;
use ReCaptcha\ReCaptcha;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Capco\AppBundle\Utils\RequestGuesser;

class ReCaptchaValidator extends ConstraintValidator
{
    protected RequestGuesser $requestGuesser;
    protected ReCaptcha $recaptcha;
    protected Manager $toggle;
    // used to disable in functional testing
    protected bool $enabled;

    public function __construct(
        RequestGuesser $requestGuesser,
        string $privateKey,
        Manager $toggle,
        bool $enabled = true
    ) {
        $this->requestGuesser = $requestGuesser;
        $this->recaptcha = new ReCaptcha($privateKey);
        $this->toggle = $toggle;
        $this->enabled = $enabled;
    }

    public function validate($value, Constraint $constraint)
    {
        $ip = $this->requestGuesser->getClientIp();
        if (
            $this->enabled &&
            $this->toggle->isActive('captcha') &&
            !$this->recaptcha->verify($value, $ip)->isSuccess()
        ) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
