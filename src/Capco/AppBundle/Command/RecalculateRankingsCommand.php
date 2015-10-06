<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RecalculateRankingsCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:recalculate-rankings')
            ->setDescription('Recalculate the rankings')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getApplication()->getKernel()->getContainer();
        $em = $container->get('doctrine')->getManager();

        $consultations = $em->getRepository('CapcoAppBundle:Consultation')
            ->findAll();

        foreach ($consultations as $consultation) {
            $excludedAuthor = !$consultation->getIncludeAuthorInRanking() ? $consultation->getAuthor()->getId() : null;

            // Opinions
            $opinions = $em->getRepository('CapcoAppBundle:Opinion')
                ->getEnabledByConsultationsOrderedByVotes($consultation, $excludedAuthor);
            $prevValue = null;
            $prevRanking = 1;
            foreach ($opinions as $key => $opinion) {
                $ranking = $opinion->getVoteCountOk() === $prevValue ? $prevRanking : $key + 1;
                $opinion->setRanking($ranking);
                $em->persist($opinion);
                $prevValue = $opinion->getVoteCountOk();
                $prevRanking = $ranking;
            }

            // Versions
            $versions = $em->getRepository('CapcoAppBundle:OpinionVersion')
                ->getEnabledByConsultationsOrderedByVotes($consultation, $excludedAuthor)
            ;
            $prevValue = null;
            $prevRanking = 1;
            foreach ($versions as $key => $version) {
                $ranking = $version->getVoteCountOk() === $prevValue ? $prevRanking : $key + 1;
                $version->setRanking($ranking);
                $em->persist($version);
                $prevValue = $version->getVoteCountOk();
                $prevRanking = $ranking;
            }
        }

        $em->flush();

        $output->writeln('Calculation completed');
    }
}
