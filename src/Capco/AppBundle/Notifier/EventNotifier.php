<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\Resolver\Event\EventUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Event\EventCreateAdminMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\RouterInterface;

class EventNotifier extends BaseNotifier
{
    protected $eventUrlResolver;
    protected $userRepository;
    protected $logger;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        EventUrlResolver $eventUrlResolver,
        UserRepository $userRepository,
        RouterInterface $router,
        LoggerInterface $logger
    ) {
        parent::__construct($mailer, $siteParams, $userResolver, $router);
        $this->eventUrlResolver = $eventUrlResolver;
        $this->userRepository = $userRepository;
        $this->logger = $logger;
        $this->siteParams = $siteParams;
    }

    public function onCreate(Event $event)
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
}
