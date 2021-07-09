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
    protected $request;
    protected $recaptcha;
    protected $enabled;
    protected $toggle;

    public function __construct(RequestStack $requestStack, string $privateKey, Manager $toggle, bool $enabled = true)
    {
        $this->request = $requestStack->getCurrentRequest();
        $this->recaptcha = new ReCaptcha($privateKey);
        $this->toggle = $toggle;
        $this->enabled = $enabled; // used to disable in functional testing
    }

    public function validate($value, Constraint $constraint)
    {
        if ($this->enabled && $this->toggle->isActive('captcha') && !$this->recaptcha->verify($value, IPGuesser::getClientIp($request))->isSuccess()) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
