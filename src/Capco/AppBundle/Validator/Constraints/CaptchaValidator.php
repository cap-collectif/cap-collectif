<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Security\CaptchaChecker;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CaptchaValidator extends ConstraintValidator
{
    public function __construct(
        protected RequestGuesserInterface $requestGuesser,
        protected Manager $toggle,
        protected CaptchaChecker $captchaChecker,
        protected bool $enabled = true
    ) {
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
