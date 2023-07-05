<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Security\CaptchaChecker;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Utils\RequestGuesser;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CaptchaValidator extends ConstraintValidator
{
    protected RequestGuesser $requestGuesser;
    protected Manager $toggle;
    protected CaptchaChecker $captchaChecker;
    // used to disable in functional testing
    protected bool $enabled;

    public function __construct(
        RequestGuesser $requestGuesser,
        Manager $toggle,
        CaptchaChecker $captchaChecker,
        bool $enabled = true
    ) {
        $this->requestGuesser = $requestGuesser;
        $this->toggle = $toggle;
        $this->captchaChecker = $captchaChecker;
        $this->enabled = $enabled;
    }

    public function validate($value, Constraint $constraint)
    {
        if (!$this->enabled || !$this->toggle->isActive('captcha')) {
            return;
        }

        $ip = $this->requestGuesser->getClientIp();
        if (!$this->captchaChecker->__invoke($value, $ip)) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
