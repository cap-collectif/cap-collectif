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
        $notifier = $container->get('capco.notify_manager');
        $manager = $container->get('capco.contribution.manager');

        $users = $em->getRepository('CapcoUserBundle:User')
                    ->findUsersThatJustExpired();

        foreach ($users as $user) {
            $contributionDeleted = $manager->depublishContributions($user);
            $user->setExpired(true);
            $user->setExpiresAt(null);
            $em->flush();
            $notifier->sendExpiredUserEmail($user, $contributionDeleted);
        }

        $output->writeln(count($users) . ' user(s) expired.');
    }
}
