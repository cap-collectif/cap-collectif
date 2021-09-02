<?php

namespace Capco\AppBundle\RedirectionIO;

use Capco\AppBundle\Toggle\Manager;
use RedirectionIO\Client\Sdk\Command\CommandInterface;
use RedirectionIO\Client\Sdk\Command\LogCommand;
use RedirectionIO\Client\Sdk\Command\MatchCommand;
use RedirectionIO\Client\Sdk\Command\MatchWithResponseCommand;
use RedirectionIO\Client\Sdk\Exception\ExceptionInterface;
use RedirectionIO\Client\Sdk\HttpMessage\Request;
use RedirectionIO\Client\Sdk\HttpMessage\Response;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;
use Symfony\Component\HttpFoundation\Request as SymfonyRequest;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\Event\PostResponseEvent;

class RequestResponseListener
{
    private $client;
    private $allowMatchOnResponse;
    private $circuitBreakers;
    private $toggleManager;
    private $excludedPrefixes;

    public function __construct(
        Manager $toggleManager,
        Client $client,
        bool $allowMatchOnResponse = false,
        iterable $circuitBreakers = []
    ) {
        $this->client = $client;
        $this->allowMatchOnResponse = $allowMatchOnResponse;
        $this->circuitBreakers = $circuitBreakers;
        $this->toggleManager = $toggleManager;
        $this->excludedPrefixes = [];
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        if (!$this->toggleManager->isActive('http_redirects')) {
            return;
        }
        if (!$event->isMasterRequest()) {
            return;
        }

        $request = $event->getRequest();

        foreach ($this->circuitBreakers as $circuitBreaker) {
            if ($circuitBreaker->shouldNotProcessRequest($request)) {
                return;
            }
        }

        $matchCommand = $this->createMatchCommand($request);

        /** @var Response $response */
        $response = $this->client->request($matchCommand);
        $request->attributes->set('redirectionio_response', $response);

        if (!$response) {
            return;
        }

        if ($response->getMatchOnResponseStatus() > 0) {
            return;
        }

        410 === $response->getStatusCode()
            ? $event->setResponse((new SymfonyResponse())->setStatusCode(410))
            : $event->setResponse(
                new SymfonyRedirectResponse($response->getLocation(), $response->getStatusCode())
            );
    }

    public function onKernelResponse(FilterResponseEvent $event)
    {
        /** @var Response $rioResponse */
        $rioResponse = $event->getRequest()->attributes->get('redirectionio_response');

        if (null === $rioResponse) {
            return;
        }

        $symfonyResponse = $event->getResponse();

        if (
            0 === $rioResponse->getMatchOnResponseStatus() ||
            $rioResponse->getMatchOnResponseStatus() !== $symfonyResponse->getStatusCode()
        ) {
            return;
        }

        410 === $rioResponse->getStatusCode()
            ? $event->setResponse((new SymfonyResponse())->setStatusCode(410))
            : $event->setResponse(
                new SymfonyRedirectResponse(
                    $rioResponse->getLocation(),
                    $rioResponse->getStatusCode()
                )
            );
    }

    public function onKernelTerminate(PostResponseEvent $event)
    {
        foreach ($this->circuitBreakers as $circuitBreaker) {
            if ($circuitBreaker->shouldNotProcessRequest($event->getRequest())) {
                return;
            }
        }

        $response = $event->getRequest()->attributes->get('redirectionio_response');

        if (!$response) {
            $symfonyResponse = $event->getResponse();
            $location = $symfonyResponse->headers->get('location', null);

            $response = new Response($event->getResponse()->getStatusCode(), null, $location);
        }

        $request = $this->createSdkRequest($event->getRequest());

        try {
            $this->client->request(new LogCommand($request, $response));
        } catch (ExceptionInterface $exception) {
            // do nothing
        }
    }

    private function createMatchCommand(SymfonyRequest $symfonyRequest): CommandInterface
    {
        $request = $this->createSdkRequest($symfonyRequest);

        if ($this->allowMatchOnResponse) {
            return new MatchWithResponseCommand($request);
        }

        return new MatchCommand($request);
    }

    private function createSdkRequest(SymfonyRequest $symfonyRequest)
    {
        return new Request(
            $symfonyRequest->getHttpHost(),
            $this->getFullPath($symfonyRequest),
            $symfonyRequest->headers->get('User-Agent'),
            $symfonyRequest->headers->get('Referer'),
            $symfonyRequest->getScheme()
        );
    }

    private function getFullPath(SymfonyRequest $symfonyRequest)
    {
        if (null === ($requestUri = $symfonyRequest->getRequestUri())) {
            return '/';
        }

        if ('' !== $requestUri && '/' !== $requestUri[0]) {
            $requestUri = '/' . $requestUri;
        }

        if (null === ($baseUrl = $symfonyRequest->getBaseUrl())) {
            return $requestUri;
        }

        $pathInfo = substr($requestUri, \strlen($baseUrl));

        if (false === $pathInfo || '' === $pathInfo) {
            return '/';
        }

        return (string) $pathInfo;
    }

    private function isExcludedPrefix($url): bool
    {
        foreach ($this->excludedPrefixes as $excludedPrefix) {
            if (0 === strpos($url, $excludedPrefix)) {
                return true;
            }
        }

        return false;
    }
}
