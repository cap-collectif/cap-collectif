<?php

namespace Capco\AppBundle\Command;

use Capco\UserBundle\Repository\UserRepository;
use Capco\AppBundle\Notifier\UserNotifier;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RemindUserAccountConfirmationCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('capco:remind-user-account-confirmation')->setDescription(
            'Remind users by email to confim their account'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $em = $container->get('doctrine')->getManager();
        $notifier = $container->get(UserNotifier::class);
        $logger = $container->get('logger');
        $userRepository = $container->get(UserRepository::class);

        $userIds = $userRepository->findNotEmailConfirmedUserIdsSince24Hours();

        foreach ($userIds as $id) {
            $user = $userRepository->find($id);
            $email = $user->getEmail();
            if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $notifier->remingAccountConfirmation($user);
            } else {
                $logger->warning(
                    __CLASS__ . ": User with id: {$user->getId}() doesn't have a valid email"
                );
            }

            // We make sure that we don't spam the user with another reminder
            $user->setRemindedAccountConfirmationAfter24Hours(true);
            $em->flush();
        }

        $output->writeln(sprintf('%d user(s) reminded.', \count($userIds)));
    }
}
