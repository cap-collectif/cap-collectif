<?php
namespace Capco\AppBundle\EventListener;

use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Symfony\Component\HttpFoundation\Response;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\Templating\EngineInterface;

class ProjectAccessDeniedExceptionListener
{
    protected $logger;
    protected $templating;

    public function __construct(LoggerInterface $logger, EngineInterface $templating)
    {
        $this->logger = $logger;
        $this->templating = $templating;
    }

    public function onKernelException(GetResponseForExceptionEvent $event)
    {
        $exception = $event->getException();

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
