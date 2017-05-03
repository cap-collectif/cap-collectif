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
            ->setName('capco:compute:projects-counters')
            ->setDescription('Recalculate the projects counters')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $em = $container->get('doctrine')->getManager();
        $contributionResolver = $container->get('capco.contribution.resolver');

        $projects = $em->getRepository('CapcoAppBundle:Project')->findAll();

        // Participants count
        foreach ($projects as $p) {
            $anonymousParticipants = $em->getRepository('CapcoUserBundle:User')
                ->countProjectProposalAnonymousVotersWithCount($p);
            $participants = $contributionResolver->countProjectContributors($p) + $anonymousParticipants;
            $query = $em->createQuery('UPDATE CapcoAppBundle:Project p
              SET p.participantsCount = ' . $participants . '
              WHERE p.externalLink IS NULL AND p.id = \'' . $p->getId() . '\''
            );
            $query->execute();
        }

        // Contributions count
        foreach ($projects as $p) {
            $contributions = $contributionResolver->countProjectContributions($p);
            $query = $em->createQuery('UPDATE CapcoAppBundle:Project p
              SET p.contributionsCount = ' . $contributions . '
              WHERE p.externalLink IS NULL AND p.id = \'' . $p->getId() . '\''
            );
            $query->execute();
        }

        // Votes count
        foreach ($projects as $p) {
            $votes = $contributionResolver->countProjectVotes($p);
            $query = $em->createQuery('UPDATE CapcoAppBundle:Project p
              SET p.votesCount = ' . $votes . '
              WHERE p.externalLink IS NULL AND p.id = \'' . $p->getId() . '\''
            );
            $query->execute();
        }

        $output->writeln('Calculation completed');
    }
}
