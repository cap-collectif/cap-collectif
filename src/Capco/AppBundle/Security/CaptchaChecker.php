<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Toggle\Manager;
use ReCaptcha\ReCaptcha;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class CaptchaChecker
{
    public function __construct(protected HttpClientInterface $client, protected Manager $toggle, protected string $turnstilePrivateKey, protected string $recaptchaPrivateKey)
    {
    }

    /**
     * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
     */
    public function __invoke(string $captcha, string $ip): bool
    {
        if ($this->toggle->isActive(Manager::turnstile_captcha)) {
            $response = $this->client->request(
                'POST',
                'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                [
                    'body' => [
                        'secret' => $this->turnstilePrivateKey,
                        'response' => $captcha,
                        'remoteip' => $ip,
                    ],
                ]
            );

            $statusCode = $response->getStatusCode();
            $content = $response->toArray();

            return 200 === $statusCode && $content['success'];
        }
        $recaptcha = new ReCaptcha($this->recaptchaPrivateKey);

        return $recaptcha->verify($captcha, $ip)->isSuccess();
    }
}
