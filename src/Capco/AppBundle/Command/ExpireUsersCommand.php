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
        $container = $this->getApplication()->getKernel()->getContainer();
        $em = $container->get('doctrine.orm.entity_manager');

        $users = $em->getRepository('CapcoUserBundle:User')
                    ->findUsersThatJustExpired();

        foreach ($users as $user) {
          // TODO the user disable contributions
          $user->setExpired(true);
        }

        $em->flush();

        $output->writeln(count($users) . ' user(s) expired.');
    }
}
