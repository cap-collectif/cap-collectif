<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Exception\ParisAuthenticationException;
use Capco\UserBundle\MonCompteParis\OpenAmClient;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Twig\Environment;

/** @deprecated  */
class ParisAuthenticationExceptionListener
{
    protected LoggerInterface $logger;
    private Environment $templating;
    private OpenAmClient $client;

    public function __construct(
        LoggerInterface $logger,
        Environment $templating,
        // use openId instead of openAm
        OpenAmClient $client
    ) {
        $this->logger = $logger;
        $this->templating = $templating;
        $this->client = $client;
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        $request = $event->getRequest();
        if ($exception instanceof ParisAuthenticationException) {
            $session = $request->getSession() ? $request->getSession()->invalidate() : '';
            $this->client->setCookie($request->cookies->get(OpenAmClient::COOKIE_NAME));
            $this->client->logoutUser();
            $response = new Response(
                $this->templating->render('@CapcoApp/Default/paris_user_not_valid.html.twig', [
                    'emailAddress' => $exception->getEmailAddress(),
                ])
            );
            $response->headers->clearCookie(
                OpenAmClient::COOKIE_NAME,
                '/',
                OpenAmClient::COOKIE_DOMAIN
            );
            $event->setResponse($response);
        }
    }
}
