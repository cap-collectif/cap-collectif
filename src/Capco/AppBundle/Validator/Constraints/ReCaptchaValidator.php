<?php

namespace Capco\AppBundle\Validator\Constraint;

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
    protected $privateKey;
    protected $driver;

    public function __construct(RequestStack $requestStack, string $privateKey, DriverInterface $driver = null)
    {
        $this->request = $requestStack->getCurrentRequest();
        $this->privateKey = $privateKey;
        $this->driver = $driver;
    }

    public function validate($value, Constraint $constraint)
    {
        if (!($constraint instanceof ReCaptchaConstraint)) {
            throw new InvalidArgumentException('Use ReCaptchaConstraint for ReCaptchaValidator.');
        }

        $reCaptcha = new ReCaptcha(
            $this->privateKey,
            $this->request->getClientIp(),
            $value,
            false, // wtf is this parametter ?
        ));

        $response = $reCaptcha->buildRequest($this->driver)->send();
        if (!$response->isSuccess()) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
