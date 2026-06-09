<?php

namespace Capco\AppBundle\Security;

use Capco\AppBundle\Toggle\Manager;
use Psr\Log\LoggerInterface;
use ReCaptcha\ReCaptcha;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class CaptchaChecker
{
    public function __construct(
        private readonly HttpClientInterface $client,
        private readonly Manager $toggle,
        private readonly string $turnstilePrivateKey,
        private readonly string $recaptchaPrivateKey,
        private readonly string $captchetatClientId,
        private readonly string $captchetatClientSecret,
        private readonly string $captchetatTokenUrl,
        private readonly string $captchetatValidateUrl,
        private readonly string $environment,
        private readonly LoggerInterface $logger
    ) {
    }

    /**
     * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
     */
    public function __invoke(string $captcha, string $ip): bool
    {
        if ('test' === $this->environment) {
            return true;
        }

        if ($this->toggle->isActive(Manager::captchetat)) {
            if ('' === $this->captchetatClientId) {
                $this->logger->error('Captchetat validation failed because client id is missing.');

                return false;
            }

            $payload = json_decode($captcha, true);
            if (!\is_array($payload) || !isset($payload['uuid']) || !isset($payload['code'])) {
                $this->logger->warning('Captchetat validation failed because payload is invalid.');

                return false;
            }

            try {
                $token = $this->fetchAccessToken();

                if (null === $token) {
                    throw new \RuntimeException('Captchat validation failed because access_token is null.');
                }

                $response = $this->client->request('POST', $this->captchetatValidateUrl, [
                    'headers' => [
                        'Authorization' => sprintf('Bearer %s', $token),
                        'Content-Type' => 'application/json',
                    ],
                    'json' => ['uuid' => $payload['uuid'], 'code' => $payload['code']],
                ]);

                $statusCode = $response->getStatusCode();
                $raw = $response->getContent(false);
                $content = json_decode($raw, true);

                $contentIndicatesSuccess = false;

                if (\is_bool($content)) {
                    $contentIndicatesSuccess = $content;
                } elseif (isset($content['success'])) {
                    $contentIndicatesSuccess = $content['success'];
                } elseif (isset($content['resultat'])) {
                    $contentIndicatesSuccess = $content['resultat'];
                }

                $success = Response::HTTP_OK === $statusCode && $contentIndicatesSuccess;

                if (!$success) {
                    $this->logger->warning('Captchetat validation failed.', [
                        'statusCode' => $statusCode,
                        'uuid' => $payload['uuid'],
                    ]);
                }

                return $success;
            } catch (\Throwable $exception) {
                $this->logger->error('Captchetat validation request failed.', [
                    'exception' => $exception::class,
                    'message' => $exception->getMessage(),
                ]);

                return false;
            }
        }

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

            return Response::HTTP_OK === $statusCode && $content['success'];
        }
        $recaptcha = new ReCaptcha($this->recaptchaPrivateKey);

        return $recaptcha->verify($captcha, $ip)->isSuccess();
    }

    public function fetchAccessToken(): ?string
    {
        $response = $this->client->request('POST', $this->captchetatTokenUrl, [
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Authorization' => 'Basic ' . base64_encode($this->captchetatClientId . ':' . $this->captchetatClientSecret),
            ],
            'body' => http_build_query([
                'grant_type' => 'client_credentials',
                'scope' => 'piste.captchetat',
            ]),
        ]);

        $responseContent = $response->toArray();

        if (!isset($responseContent['access_token'])) {
            return null;
        }

        return $responseContent['access_token'];
    }
}
