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
        $em        = $container->get('doctrine')->getManager();

        $projects = $em->getRepository('CapcoAppBundle:Project')
            ->findAll();

        foreach ($projects as $project) {
            $excludedAuthor = !$project->getIncludeAuthorInRanking() && $project->getAuthor() ? $project->getAuthor()->getId() : null;

            // Opinions
            $opinions = $em->getRepository('CapcoAppBundle:Opinion')
                ->getEnabledByProjectsOrderedByVotes($project, $excludedAuthor);

            $prevValue   = null;
            $prevRanking = 1;
            foreach ($opinions as $key => $opinion) {
                $ranking = $opinion->getVotesCountOk() === $prevValue ? $prevRanking : $key + 1;
                $opinion->setRanking($ranking);
                $prevValue   = $opinion->getVotesCountOk();
                $prevRanking = $ranking;
            }

            // Versions
            $versions = $em->getRepository('CapcoAppBundle:OpinionVersion')
                ->getEnabledByProjectsOrderedByVotes($project, $excludedAuthor)
            ;

            $prevValue   = null;
            $prevRanking = 1;
            foreach ($versions as $key => $version) {
                $ranking = $version->getVotesCountOk() === $prevValue ? $prevRanking : $key + 1;
                $version->setRanking($ranking);
                $prevValue   = $version->getVotesCountOk();
                $prevRanking = $ranking;
            }
        }

        $em->flush();

        $output->writeln('Calculation completed');
    }
}
