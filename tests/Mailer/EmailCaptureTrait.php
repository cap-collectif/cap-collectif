<?php

namespace Capco\Tests\Mailer;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\SenderEmailResolver;
use Capco\AppBundle\Manager\TokenManager;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\Tests\Command\EmailCaptureListener;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\Mailer\Event\MessageEvent;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport\NullTransport;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Environment;

trait EmailCaptureTrait
{
    protected function captureEmails(): EmailCaptureListener
    {
        $capture = new EmailCaptureListener();
        $dispatcher = new EventDispatcher();
        $dispatcher->addListener(MessageEvent::class, $capture->onMessage(...));
        $mailer = new Mailer(new NullTransport($dispatcher));

        $container = self::getContainer();
        $twig = $container->get(Environment::class);
        \assert($twig instanceof Environment);
        $translator = $container->get(TranslatorInterface::class);
        \assert($translator instanceof TranslatorInterface);
        $siteParameterResolver = $container->get(SiteParameterResolver::class);
        \assert($siteParameterResolver instanceof SiteParameterResolver);
        $router = $container->get(RouterInterface::class);
        \assert($router instanceof RouterInterface);
        $senderEmailResolver = $container->get(SenderEmailResolver::class);
        \assert($senderEmailResolver instanceof SenderEmailResolver);
        $tokenManager = $container->get(TokenManager::class);
        \assert($tokenManager instanceof TokenManager);
        $container->set(
            MailerService::class,
            new MailerService(
                $mailer,
                $twig,
                $translator,
                $siteParameterResolver,
                $router,
                $senderEmailResolver,
                $tokenManager
            )
        );

        return $capture;
    }
}
