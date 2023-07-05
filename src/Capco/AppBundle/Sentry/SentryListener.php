<?php

namespace Capco\AppBundle\Sentry;

use Capco\AppBundle\Utils\RequestGuesser;
use Psr\Log\LoggerInterface;
use Sentry\State\HubInterface;
use Sentry\State\Scope;
use Symfony\Component\Console\ConsoleEvents;
use Symfony\Component\Console\Event\ConsoleCommandEvent;
use Symfony\Component\Console\Event\ConsoleErrorEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ControllerEvent;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\TerminateEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Core\Security;

class SentryListener implements EventSubscriberInterface
{
    private $hub;
    private $security;
    private $logger;

    public function __construct(HubInterface $hub, Security $security, LoggerInterface $logger)
    {
        $this->hub = $hub;
        $this->security = $security;
        $this->logger = $logger;
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMasterRequest()) {
            return;
        }

        $request = $event->getRequest();
        $userData['ip_address'] = RequestGuesser::getClientIpFromRequest($request);

        if ($user = $this->security->getUser()) {
            $userData['username'] = $user->getUsername();
            $userData['email'] = $user->getEmail();
            $userData['roles'] = json_encode($user->getRoles());
        } else {
            $userData['username'] = 'anon.';
        }

        $this->hub->configureScope(static function (Scope $scope) use ($userData, $request): void {
            $scope->setUser($userData);
            $scope->setTag('request_locale', $request->getLocale());
        });
    }

    public function onKernelController(ControllerEvent $event): void
    {
        if (!$event->isMasterRequest()) {
            return;
        }

        if (!$event->getRequest()->attributes->has('_route')) {
            return;
        }

        $request = $event->getRequest();
        $matchedRoute = (string) $request->attributes->get('_route');
        $refererUrl = filter_var($request->headers->get('referer'), \FILTER_SANITIZE_URL);

        $this->hub->configureScope(static function (Scope $scope) use (
            $matchedRoute,
            $refererUrl
        ): void {
            $scope->setTag('route', $matchedRoute);
            $scope->setTag('referer', $refererUrl);
        });
    }

    public function onKernelTerminate(TerminateEvent $event): void
    {
        $statusCode = $event->getResponse()->getStatusCode();

        $this->hub->configureScope(static function (Scope $scope) use ($statusCode): void {
            $scope->setTag('status_code', (string) $statusCode);
        });

        if ($statusCode >= 500) {
            // 5XX response are private/security data safe so let's log them for debugging purpose
            $this->logger->error('500 returned', ['response' => $event->getResponse()]);
        }
    }

    public function onConsoleCommand(ConsoleCommandEvent $event): void
    {
        $command = $event->getCommand();
        $this->hub->configureScope(static function (Scope $scope) use ($command): void {
            $scope->setTag('command', $command ? $command->getName() : 'N/A');
        });
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $this->hub->captureException($event->getThrowable());
    }

    public function onConsoleError(ConsoleErrorEvent $event): void
    {
        $this->hub->captureException($event->getError());

        $command = $event->getCommand();
        $this->hub->configureScope(static function (Scope $scope) use ($command): void {
            $scope->setTag('command', $command ? $command->getName() : 'N/A');
        });
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 1],
            KernelEvents::CONTROLLER => ['onKernelController', 10000],
            KernelEvents::TERMINATE => ['onKernelTerminate', 1],
            ConsoleEvents::COMMAND => ['onConsoleCommand', 1],
            KernelEvents::EXCEPTION => ['onKernelException', 1],
            ConsoleEvents::ERROR => ['onConsoleError', 1],
        ];
    }
}
