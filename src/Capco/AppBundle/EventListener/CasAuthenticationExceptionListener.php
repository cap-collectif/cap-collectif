<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Exception\CasAuthenticationException;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;

/**
 * Class CasAuthenticationExceptionListener.
 */
class CasAuthenticationExceptionListener
{
    protected LoggerInterface $logger;

    private readonly Environment $templating;

    public function __construct(
        LoggerInterface $logger,
        Environment $templating
    ) {
        $this->logger = $logger;
        $this->templating = $templating;
    }

    /**
     * @throws LoaderError
     * @throws RuntimeError
     * @throws SyntaxError
     */
    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        $request = $event->getRequest();
        if ($exception instanceof CasAuthenticationException) {
            $request->getSession() ? $request->getSession()->invalidate() : '';
            $response = new Response(
                $this->templating->render('@CapcoApp/Default/cas_user_not_valid.html.twig', [
                    'errorCas' => $exception->getErrorCas(),
                ])
            );

            $event->setResponse($response);
        }
    }
}
