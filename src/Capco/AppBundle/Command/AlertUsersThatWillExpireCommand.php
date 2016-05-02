<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class AlertUsersThatWillExpireCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:alert-users-that-will-expire')
            ->setDescription('Send a mail to user that are going to expire.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getApplication()->getKernel()->getContainer();
        $em = $container->get('doctrine.orm.entity_manager');
        $notifier = $container->get('capco.notify_manager');

        $users = $em->getRepository('CapcoUserBundle:User')
                    ->findUsersThatWillExpireIn24Hours();

        foreach ($users as $user) {
            $notifier->sendAlertExpirationUserEmail($user);
            $user->setAlertExpirationSent(true);
            $em->flush();
        }

        $output->writeln(count($users).' user(s) alerted.');
    }
}
