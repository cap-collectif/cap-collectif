<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RecalculateConsultationsCountersCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:recalculate-consultations-counters')
            ->setDescription('Recalculate the consultations counters')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getApplication()->getKernel()->getContainer();
        $em = $container->get('doctrine.orm.entity_manager');
        $contributionResolver = $container->get('capco.contribution.resolver');

        $consultations = $em->getRepository('CapcoAppBundle:Consultation')->findAll();

        // Participants count
        foreach ($consultations as $c) {
            $participants = $contributionResolver->countConsultationContributors($c);
            $query = $em->createQuery('
              update CapcoAppBundle:Consultation c
              set c.participantsCount = '.$participants.'
              where c.id = '.$c->getId()
            );
            $query->execute();
        }

        // Contributions count
        foreach ($consultations as $c) {
            $contributions = $contributionResolver->countConsultationContributions($c);
            $query = $em->createQuery('
              update CapcoAppBundle:Consultation c
              set c.contributionsCount = '.$contributions.'
              where c.id = '.$c->getId()
            );
            $query->execute();
        }

        // Contributions count
        foreach ($consultations as $c) {
            $votes = $contributionResolver->countConsultationVotes($c);
            $query = $em->createQuery('
              update CapcoAppBundle:Consultation c
              set c.votesCount = '.$votes.'
              where c.id = '.$c->getId()
            );
            $query->execute();
        }

        $output->writeln('Calculation completed');
    }
}
