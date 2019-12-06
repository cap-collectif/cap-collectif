<?php

namespace Capco\AppBundle\Command;

use Capco\UserBundle\Repository\UserRepository;
use Capco\AppBundle\Notifier\UserNotifier;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RemindUserAccountConfirmationCommand extends Command
{
    private $logger;
    private $entityManager;
    private $userNotifier;
    private $userRepository;

    public function __construct(
        LoggerInterface $logger,
        ?string $name = null,
        EntityManagerInterface $entityManager,
        UserNotifier $userNotifier,
        UserRepository $userRepository
    ) {
        $this->logger = $logger;
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
        $this->userNotifier = $userNotifier;
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
        $userIds = $this->userRepository->findNotEmailConfirmedUserIdsSince24Hours();

        foreach ($userIds as $id) {
            $user = $this->userRepository->find($id);
            $email = $user->getEmail();
            if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->userNotifier->remingAccountConfirmation($user);
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
    }
}
