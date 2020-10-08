<?php

namespace Capco\AppBundle\EventListener;

use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Symfony\Component\HttpFoundation\Response;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Twig\Environment;

class ProjectAccessDeniedExceptionListener
{
    protected LoggerInterface $logger;
    protected Environment $templating;

    public function __construct(LoggerInterface $logger, Environment $templating)
    {
        $this->logger = $logger;
        $this->templating = $templating;
    }

    public function onKernelException(ExceptionEvent $event)
    {
        $exception = $event->getThrowable();

        if (!$exception instanceof ProjectAccessDeniedException) {
            return;
        }

        $params = ['title' => 'unauthorized-access'];

        $response = new Response(
            $this->templating->render('CapcoAppBundle:Default:403.html.twig', $params)
        );
        $event->setResponse($response);
    }
}
