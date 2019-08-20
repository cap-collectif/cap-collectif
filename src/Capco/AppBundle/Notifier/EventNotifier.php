<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\GraphQL\Resolver\Event\EventUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\EventCreateAdminMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\Translation\TranslatorInterface;

class EventNotifier extends BaseNotifier
{
    protected $eventResolver;
    protected $proposalResolver;
    protected $proposalUrlResolver;
    protected $userUrlResolver;
    protected $translator;
    protected $eventUrlResolver;
    protected $userRepository;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        TranslatorInterface $translator,
        EventUrlResolver $eventUrlResolver,
        UserRepository $userRepository
    ) {
        parent::__construct($mailer, $siteParams, $userResolver);
        $this->eventUrlResolver = $eventUrlResolver;
        $this->translator = $translator;
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
