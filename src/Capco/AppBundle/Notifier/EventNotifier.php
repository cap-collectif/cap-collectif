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
use Symfony\Component\Routing\RouterInterface;

class EventNotifier extends BaseNotifier
{
    protected $eventUrlResolver;
    protected $userRepository;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        EventUrlResolver $eventUrlResolver,
        UserRepository $userRepository,
        RouterInterface $router
    ) {
        parent::__construct($mailer, $siteParams, $userResolver, $router);
        $this->eventUrlResolver = $eventUrlResolver;
        $this->userRepository = $userRepository;
    }

    public function onCreate(Event $event)
    {
        $admins = $this->userRepository->getAllAdmin();

        /** @var User $admin */
        foreach ($admins as $admin) {
            $this->mailer->sendMessage(
                EventCreateAdminMessage::create(
                    $event,
                    $this->eventUrlResolver->__invoke($event, true),
                    $admin->getEmail(),
                    $admin->getDisplayName()
                )
            );
        }
    }
}
