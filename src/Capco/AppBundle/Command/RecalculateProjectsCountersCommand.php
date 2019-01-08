<?php

namespace Capco\AppBundle\Command;

use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Console\Input\InputOption;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Resolver\ContributionResolver;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectContributorResolver;

class RecalculateProjectsCountersCommand extends ContainerAwareCommand
{
    public $force;

    protected function configure()
    {
        $this->setName('capco:compute:projects-counters')
            ->setDescription('Recalculate the projects counters')
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force complete recomputation'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $em = $container->get('doctrine')->getManager();
        $contributionResolver = $container->get(ContributionResolver::class);
        $this->force = $input->getOption('force');

        $projects = $this->getContainer()
            ->get(ProjectRepository::class)
            ->findAll();

        foreach ($projects as $p) {
            if (!$p->isClosed() || $this->force) {
                $connection = $container
                    ->get(ProjectContributorResolver::class)
                    ->__invoke($p, new Argument(['first' => 1]));
                $participants = $connection->totalCount + $connection->anonymousCount;
                $query = $em->createQuery(
                    'UPDATE CapcoAppBundle:Project p
                SET p.participantsCount = ' .
                        $participants .
                        '
                WHERE p.externalLink IS NULL AND p.id = \'' .
                        $p->getId() .
                        '\''
                );
                $query->execute();

                // Votes count
                $votes = $contributionResolver->countProjectVotes($p);
                $query = $em->createQuery(
                    'UPDATE CapcoAppBundle:Project p
                SET p.votesCount = ' .
                        $votes .
                        '
                WHERE p.externalLink IS NULL AND p.id = \'' .
                        $p->getId() .
                        '\''
                );
                $query->execute();
            }
        }

        $output->writeln('Calculation completed');
    }
}
