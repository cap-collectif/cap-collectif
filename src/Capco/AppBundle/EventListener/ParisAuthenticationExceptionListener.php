<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Exception\ParisAuthenticationException;
use Capco\UserBundle\MonCompteParis\OpenAmClient;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\Templating\EngineInterface;

class ParisAuthenticationExceptionListener
{
    protected $logger;
    private $templating;
    private $client;

    public function __construct(LoggerInterface $logger, EngineInterface $templating, OpenAmClient $client)
    {
        $this->logger = $logger;
        $this->templating = $templating;
        $this->client = $client;
    }

    public function onKernelException(GetResponseForExceptionEvent $event): void
    {
        $exception = $event->getException();
        $request = $event->getRequest();
        if ($exception instanceof ParisAuthenticationException) {
            $request->getSession()->invalidate();
            $this->client->setCookie($request->cookies->get(OpenAmClient::COOKIE_NAME));
            $this->client->logoutUser();
            $response = new Response($this->templating->render('@CapcoApp/Default/paris_user_not_valid.html.twig', ['emailAddress' => $exception->getEmailAddress()]));
            $response->headers->clearCookie(OpenAmClient::COOKIE_NAME, '/', OpenAmClient::COOKIE_DOMAIN);
            $event->setResponse($response);
        }
    }
}
