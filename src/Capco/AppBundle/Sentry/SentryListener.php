<?php

namespace Capco\AppBundle\Sentry;

use Psr\Log\LoggerInterface;
use Sentry\State\HubInterface;
use Sentry\State\Scope;
use Symfony\Component\Console\ConsoleEvents;
use Symfony\Component\Console\Event\ConsoleCommandEvent;
use Symfony\Component\Console\Event\ConsoleErrorEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\HttpKernel\Event\PostResponseEvent;
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

    public function onKernelRequest(GetResponseEvent $event): void
    {
        if (!$event->isMasterRequest()) {
            return;
        }

        $userData['ip_address'] = $event->getRequest()->getClientIp();

        if ($user = $this->security->getUser()) {
            $userData['username'] = $user->getUsername();
            $userData['roles'] = $user->getRoles();
        }

        $this->hub->configureScope(static function (Scope $scope) use ($userData): void {
            $scope->setUser($userData);
        });
    }

    public function onKernelController(FilterControllerEvent $event): void
    {
        if (!$event->isMasterRequest()) {
            return;
        }

        if (!$event->getRequest()->attributes->has('_route')) {
            return;
        }

        $matchedRoute = (string) $event->getRequest()->attributes->get('_route');

        $this->hub->configureScope(static function (Scope $scope) use ($matchedRoute): void {
            $scope->setTag('route', $matchedRoute);
        });
    }

    public function onKernelTerminate(PostResponseEvent $event): void
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

    public function onKernelException(GetResponseForExceptionEvent $event): void
    {
        $this->hub->captureException($event->getException());
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
            ConsoleEvents::ERROR => ['onConsoleError', 1]
        ];
    }
}
