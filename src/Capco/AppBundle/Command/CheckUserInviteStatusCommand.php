<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\DBAL\Enum\MailerType;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\Repository\UserInviteRepository;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Exception\InvalidOptionException;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Mailer\Bridge\Mailchimp\Transport\MandrillApiTransport;
use Symfony\Component\Mailer\Bridge\Mailjet\Transport\MailjetApiTransport;

class CheckUserInviteStatusCommand extends Command
{
    protected static $defaultName = 'capco:check:user-invite-status';

    public function __construct(
        private readonly Publisher $publisher,
        private readonly UserInviteRepository $inviteRepository,
        ?string $name
    ) {
        parent::__construct($name);
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
            $usedProviderClass = MailerType::MAILJET === $lastEmailMessage->getMailerType()
                ? MailjetApiTransport::class
                : MandrillApiTransport::class;
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::USER_INVITE_CHECK,
                new Message(
                    json_encode([
                        'id' => $lastEmailMessage->getId(),
                        'provider' => $usedProviderClass,
                    ], \JSON_THROW_ON_ERROR)
                )
            );
        }
        $output->writeln('<info>Done re-publishing, bye !</info>');

        return true;
    }
}
