<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Repository\UserInviteRepository;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CheckUserInviteStatusCommand extends Command
{
    protected static $defaultName = 'capco:check:user-invite-status';

    private Publisher $publisher;
    private UserInviteRepository $inviteRepository;

    public function __construct(
        Publisher $publisher,
        UserInviteRepository $inviteRepository,
        ?string $name
    ) {
        parent::__construct($name);
        $this->publisher = $publisher;
        $this->inviteRepository = $inviteRepository;
    }

    protected function configure(): void
    {
        $this->setName('capco:check:user-invite-status')->setDescription(
            'Check status of already sent UserInvite.'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        /** @var UserInvite[] $invitations */
        $invitations = $this->inviteRepository->getNotExpiredInvitationsByStatus();
        $output->writeln('<info>' . \count($invitations) . ' invitations to re-publish.</info>');
        foreach ($invitations as $invitation) {
            $output->writeln(
                '<info>Re-publishing invitation with id : ' . $invitation->getId() . '</info>'
            );
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::USER_INVITE_CHECK,
                new Message(
                    json_encode([
                        'id' => $invitation->getId(),
                        'provider' => $invitation->getProvider(),
                    ])
                )
            );
        }
        $output->writeln('<info>Done re-publishing, bye !</info>');

        return true;
    }
}
