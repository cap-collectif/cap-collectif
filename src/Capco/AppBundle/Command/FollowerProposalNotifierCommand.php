<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class FollowerProposalNotifierCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:follower-proposal-notifier')
            ->setDescription('Send email to followers of proposals')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $em = $container->get('doctrine')->getManager();

        $proposal = $em->getRepository('CapcoAppBundle:Proposal')->getContributionsSince();

        var_dump($proposal);

        $output->writeln(
            '<info>opinions successfully created.</info>'
        );

        return 0;
    }
}
