<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\Resolver\Event\EventUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Event\EventCreateAdminMessage;
use Capco\AppBundle\Mailer\Message\Event\EventDeleteAdminMessage;
use Capco\AppBundle\Mailer\Message\Event\EventEditAdminMessage;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\RouterInterface;

class EventNotifier extends BaseNotifier
{
    private $eventUrlResolver;
    private $userRepository;
    private $logger;
    private $eventRepository;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        EventUrlResolver $eventUrlResolver,
        UserRepository $userRepository,
        RouterInterface $router,
        LoggerInterface $logger,
        EventRepository $eventRepository
    ) {
        parent::__construct($mailer, $siteParams, $userResolver, $router);
        $this->eventUrlResolver = $eventUrlResolver;
        $this->userRepository = $userRepository;
        $this->logger = $logger;
        $this->siteParams = $siteParams;
        $this->eventRepository = $eventRepository;
    }

    public function onCreate(Event $event): array
    {
        $admins = $this->userRepository->getAllAdmin();
        $messages = [];
        /** @var User $admin */
        foreach ($admins as $admin) {
            $messages[$admin->getDisplayName()] = $this->mailer->sendMessage(
                EventCreateAdminMessage::create(
                    $event,
                    $this->eventUrlResolver->__invoke($event, true),
                    $admin->getEmail(),
                    $this->baseUrl,
                    $this->siteName,
                    $this->siteUrl,
                    $admin->getDisplayName()
                )
            );
        }

        return $messages;
    }

    public function onUpdate(Event $event): array
    {
        $admins = $this->userRepository->getAllAdmin();
        $messages = [];
        /** @var User $admin */
        foreach ($admins as $admin) {
            $messages[$admin->getDisplayName()] = $this->mailer->sendMessage(
                EventEditAdminMessage::create(
                    $event,
                    $this->eventUrlResolver->__invoke($event, true),
                    $admin->getEmail(),
                    $this->baseUrl,
                    $this->siteName,
                    $this->siteUrl,
                    $admin->getDisplayName()
                )
            );
        }

        return $messages;
    }

    public function onDelete(array $event): array
    {
        /** @var Event $event */
        $event = $this->eventRepository->find($event['eventId']);
        if (!$event) {
            throw new NotFoundHttpException('event not found');
        }
        $admins = $this->userRepository->getAllAdmin();
        $messages = [];
        /** @var User $admin */
        foreach ($admins as $admin) {
            $messages[$admin->getDisplayName()] = $this->mailer->sendMessage(
                EventDeleteAdminMessage::create(
                    $event,
                    $this->eventUrlResolver->__invoke($event, true),
                    $admin->getEmail(),
                    $this->baseUrl,
                    $this->siteName,
                    $this->siteUrl,
                    $admin->getDisplayName()
                )
            );
        }

        return $messages;
    }

    public function mockData(ContainerInterface $container): array
    {
        return EventEditAdminMessage::mockData($container);
    }
}
