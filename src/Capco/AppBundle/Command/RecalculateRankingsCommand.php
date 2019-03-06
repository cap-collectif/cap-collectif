<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RecalculateRankingsCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('capco:compute:rankings')->setDescription('Recalculate the rankings');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $em = $container->get('doctrine')->getManager();

        $projects = $this->getContainer()
            ->get(ProjectRepository::class)
            ->findAll();

        foreach ($projects as $project) {
            $excludedAuthor =
                !$project->getIncludeAuthorInRanking() && $project->getAuthor()
                    ? $project->getAuthor()->getId()
                    : null;

            // Opinions
            $opinions = $this->getContainer()
                ->get(OpinionRepository::class)
                ->getEnabledByProjectsOrderedByVotes($project, $excludedAuthor);

            $prevValue = null;
            $prevRanking = 1;
            foreach ($opinions as $key => $opinion) {
                $ranking = $opinion->getVotesCountOk() === $prevValue ? $prevRanking : $key + 1;
                $opinion->setRanking($ranking);
                $prevValue = $opinion->getVotesCountOk();
                $prevRanking = $ranking;
            }

            // Versions
            $versions = $this->getContainer()
                ->get('capco.opinion_version.repository')
                ->getEnabledByProjectsOrderedByVotes($project, $excludedAuthor);

            $prevValue = null;
            $prevRanking = 1;
            foreach ($versions as $key => $version) {
                $ranking = $version->getVotesCountOk() === $prevValue ? $prevRanking : $key + 1;
                $version->setRanking($ranking);
                $prevValue = $version->getVotesCountOk();
                $prevRanking = $ranking;
            }
        }

        $em->flush();

        $output->writeln('Calculation completed');
    }
}
