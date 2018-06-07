<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ExpireUsersCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:expire-users')
            ->setDescription('Expires users and disable their publications')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $em = $container->get('doctrine')->getManager();
        $notifier = $container->get('capco.user_notifier');
        $manager = $container->get('capco.contribution.manager');

        $users = $container->get('capco.user.repository')
                    ->findUsersThatJustExpired();

        foreach ($users as $user) {
            $contributionDeleted = $manager->depublishContributions($user);
            $user->setExpired(true);
            $user->setExpiresAt(null);
            $em->flush();

            $user->getEmail() && filter_var($user->getEmail(), FILTER_VALIDATE_EMAIL)
                ? $notifier->expired($user, $contributionDeleted)
                : $container->get('logger')->warning(__CLASS__ . ": User with id: $user->getId() doesn't have a valid email");
        }

        $output->writeln(sprintf('%d user(s) expired.', \count($users)));
    }
}
