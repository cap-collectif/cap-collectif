<?php

namespace Capco\AppBundle\Security;

use ReCaptcha\ReCaptcha;

class CaptchaChecker
{
    private $recaptcha;

    public function __construct(string $apiKey)
    {
        $this->recaptcha = new ReCaptcha($apiKey);
    }

    public function __invoke(string $captcha, string $ip): bool
    {
        return $this->recaptcha->verify($captcha, $ip)->isSuccess();
    }
}
