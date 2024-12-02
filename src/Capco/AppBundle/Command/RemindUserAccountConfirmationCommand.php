<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RemindUserAccountConfirmationCommand extends Command
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository,
        private readonly Manager $toggleManager,
        private readonly Publisher $publisher,
        ?string $name = null
    ) {
        parent::__construct($name);
    }

    protected function configure()
    {
        $this->setName('capco:remind-user-account-confirmation')->setDescription(
            'Remind users by email to confim their account'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->toggleManager->isActive('remind_user_account_confirmation')) {
            $this->logger->warning(
                __CLASS__ . ': remind_user_account_confirmation feature toggle is not active.'
            );

            return 0;
        }

        $userIds = $this->userRepository->foundUnconfirmedUsersInTheLast24Hours();
        foreach ($userIds as $id) {
            $user = $this->userRepository->find($id);
            $email = $user->getEmail();
            if ($email && filter_var($email, \FILTER_VALIDATE_EMAIL)) {
                $message = new Message(json_encode(['userId' => $user->getId()]));
                $this->publisher->publish(
                    CapcoAppBundleMessagesTypes::USER_EMAIL_REMINDER,
                    $message
                );
            } else {
                $this->logger->warning(
                    __CLASS__ . ": User with id: {$user->getId}() doesn't have a valid email"
                );
            }

            // We make sure that we don't spam the user with another reminder
            $user->setRemindedAccountConfirmationAfter24Hours(true);
            $this->entityManager->flush();
        }

        $output->writeln(sprintf('%d user(s) reminded.', \count($userIds)));

        return 0;
    }
}
