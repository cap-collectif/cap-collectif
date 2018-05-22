<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Exception\ParisAuthenticationException;
use Capco\UserBundle\MonCompteParis\OpenAmClient;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\Templating\EngineInterface;

class ExceptionsListener
{
    protected $logger;
    /**
     * @var EngineInterface
     */
    private $templating;

    public function __construct(LoggerInterface $logger, EngineInterface $templating)
    {
        $this->logger = $logger;
        $this->templating = $templating;
    }

    public function onKernelException(GetResponseForExceptionEvent $event): void
    {
        $exception = $event->getException();
        $request = $event->getRequest();
        if ($exception instanceof ParisAuthenticationException) {
            $request->getSession()->invalidate();
            $response = new Response($this->templating->render('@CapcoApp/Default/paris_user_not_valid.html.twig', ['emailAddress' => $exception->getEmailAddress()]));
            $response->headers->clearCookie(OpenAmClient::COOKIE_NAME, '/', OpenAmClient::COOKIE_DOMAIN);
            $event->setResponse($response);
        }
    }
}
