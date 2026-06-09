<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Security\CaptchaChecker;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class CaptchetatProxyController extends AbstractController
{
    public function __construct(
        private readonly HttpClientInterface $client,
        private readonly string $captchetatClientId,
        private readonly string $captchetatApiUrl,
        private readonly LoggerInterface $logger,
        private readonly CaptchaChecker $captchaChecker,
    ) {
    }

    /**
     * @Route("/captchetat-proxy", name="captchetat_proxy", options={"i18n" = false}, methods={"GET", "POST"})
     */
    public function proxy(Request $request): Response
    {
        if ('' === $this->captchetatClientId) {
            $this->logger->error('Captchetat proxy failed because client id is missing.');

            return new Response('', Response::HTTP_BAD_GATEWAY);
        }

        if ($request->isMethod('POST')) {
            $payload = json_decode($request->getContent(), true);
            if (!\is_array($payload) || !isset($payload['uuid'], $payload['code'])) {
                return new JsonResponse(['success' => false], Response::HTTP_BAD_REQUEST);
            }

            $success = $this->captchaChecker->__invoke(
                json_encode(['uuid' => $payload['uuid'], 'code' => $payload['code']]),
                $request->getClientIp() ?? ''
            );

            return new JsonResponse([
                'success' => $success,
            ]);
        }

        $query = [];
        foreach (['get', 'c', 't'] as $key) {
            if ($request->query->has($key)) {
                $query[$key] = $request->query->get($key);
            }
        }

        try {
            $token = $this->captchaChecker->fetchAccessToken();

            if (null === $token) {
                throw new \RuntimeException('Captchetat proxy failed because access_token is null.');
            }

            $upstream = $this->client->request('GET', $this->captchetatApiUrl, [
                'headers' => ['Authorization' => "Bearer {$token}"],
                'query' => $query,
            ]);

            $contentType = $upstream->getHeaders(false)['content-type'][0] ?? 'application/json';
            $statusCode = $upstream->getStatusCode();

            if (Response::HTTP_OK !== $statusCode) {
                $this->logger->warning('Captchetat proxy received a non successful response.', [
                    'statusCode' => $statusCode,
                    'get' => $request->query->get('get'),
                ]);
            }

            return new Response($upstream->getContent(false), $statusCode, [
                'Content-Type' => $contentType,
            ]);
        } catch (\Throwable $exception) {
            $this->logger->error('Captchetat proxy request failed.', [
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
                'get' => $request->query->get('get'),
            ]);

            return new Response('', Response::HTTP_BAD_GATEWAY);
        }
    }
}
