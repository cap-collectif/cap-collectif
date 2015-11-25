<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RecalculateProjectsCountersCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:recalculate-projects-counters')
            ->setDescription('Recalculate the projects counters')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container            = $this->getApplication()->getKernel()->getContainer();
        $em                   = $container->get('doctrine.orm.entity_manager');
        $contributionResolver = $container->get('capco.contribution.resolver');

        $projects = $em->getRepository('CapcoAppBundle:Project')->findAll();

        // Participants count
        foreach ($projects as $p) {
            $participants = $contributionResolver->countProjectContributors($p);
            $query        = $em->createQuery('
              update CapcoAppBundle:Project p
              set p.participantsCount = '.$participants.'
              where p.id = '.$p->getId()
            );
            $query->execute();
        }

        // Contributions count
        foreach ($projects as $p) {
            $contributions = $contributionResolver->countProjectContributions($p);
            $query         = $em->createQuery('
              update CapcoAppBundle:Project p
              set p.contributionsCount = '.$contributions.'
              where p.id = '.$p->getId()
            );
            $query->execute();
        }

        // Votes count
        foreach ($projects as $p) {
            $votes = $contributionResolver->countProjectVotes($p);
            $query = $em->createQuery('
              update CapcoAppBundle:Project p
              set p.votesCount = '.$votes.'
              where p.id = '.$p->getId()
            );
            $query->execute();
        }

        $output->writeln('Calculation completed');
    }
}
