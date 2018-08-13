<?php
namespace Capco\AppBundle\Command;

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
        $notifier = $container->get('capco.user_notifier');
        $logger = $container->get('logger');

        //        $manager = $container->get('capco.contribution.manager');

        $users = $container->get('capco.user.repository')->findNotEmailConfirmedUsersSince24Hours();

        foreach ($users as $user) {
            $email = $user->getEmail();
            if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $notifier->remingAccountConfirmation($user);
            } else {
                $logger->warning(
                    __CLASS__ . ": User with id: {$user->getId}() doesn't have a valid email"
                );
            }

            // We make sure that we don't spam the user with another reminder
            $user->setRemindAccountConfirmation(true);
            $em->flush();
        }

        $output->writeln(sprintf('%d user(s) reminded.', \count($users)));
    }
}
