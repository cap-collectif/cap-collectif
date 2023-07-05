<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\Mailer\Transport\MailjetTransport;
use Capco\AppBundle\Mailer\Transport\MandrillTransport;
use Capco\AppBundle\Repository\UserInviteRepository;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Exception\InvalidOptionException;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
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
        $this->setName('capco:check:user-invite-status')
            ->setDescription('Check status of already sent UserInvite.')
            ->addOption('status', 's', InputOption::VALUE_OPTIONAL, 'Filter invitations by status')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        if (
            ($optionStatus = $input->getOption('status'))
            && !\in_array(
                $optionStatus,
                [
                    UserInviteEmailMessage::WAITING_SENDING,
                    UserInviteEmailMessage::SENT,
                    UserInviteEmailMessage::SEND_FAILURE,
                ],
                true
            )
        ) {
            throw new InvalidOptionException('The given status does not match anny existing UserInvite status.');
        }
        /** @var UserInvite[] $invitations */
        $invitations = $this->inviteRepository->getNotExpiredInvitationsByStatus($optionStatus);
        $output->writeln('<info>' . \count($invitations) . ' invitations to re-publish.</info>');
        foreach ($invitations as $invitation) {
            $output->writeln(
                '<info>Re-publishing invitation with id : ' . $invitation->getId() . '</info>'
            );
            /** @var UserInviteEmailMessage $lastEmailMessage */
            $lastEmailMessage = $invitation->getEmailMessages()->last();
            $usedProviderClass = $lastEmailMessage->getMailjetId()
                ? MailjetTransport::class
                : MandrillTransport::class;
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::USER_INVITE_CHECK,
                new Message(
                    json_encode([
                        'id' => $lastEmailMessage->getId(),
                        'provider' => $usedProviderClass,
                    ])
                )
            );
        }
        $output->writeln('<info>Done re-publishing, bye !</info>');

        return true;
    }
}
