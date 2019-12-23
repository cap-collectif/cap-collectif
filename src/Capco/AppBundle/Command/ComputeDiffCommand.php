<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\OpinionModal;
use Capco\AppBundle\Generator\DiffGenerator;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ComputeDiffCommand extends Command
{
    private $container;

    public function __construct(string $name = null, ContainerInterface $container)
    {
        $this->container = $container;
        parent::__construct($name);
    }

    protected function configure()
    {
        $this->setName('capco:compute:diff')
            ->setDescription('Recalculate diff')
            ->addOption(
                'force',
                false,
                InputOption::VALUE_NONE,
                'set this option to force the recompute on non empty diff'
            );
        $this->addOption('delimiter', 'd');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $em = $container->get('doctrine')->getManager();
        $repo = $this->getContainer()->get(OpinionVersionRepository::class);

        $versions = $repo->getAllIds();

        $progress = new ProgressBar($output, \count($versions));

        foreach ($versions as $versionId) {
            $version = $repo->find($versionId);
            if ('' === $version->getDiff() || $input->getOption('force')) {
                $container->get(DiffGenerator::class)->generate($version);
                $em->flush();
            }
            $progress->advance();
        }
        $progress->finish();

        $modals = $em->getRepository(OpinionModal::class)->findAll();
        $progress = new ProgressBar($output, \count($modals));
        foreach ($modals as $modal) {
            $container->get(DiffGenerator::class)->generate($modal);
            $em->flush();
            $progress->advance();
        }
        $progress->finish();

        $output->writeln('Computation completed');
    }

    private function getContainer()
    {
        return $this->container;
    }
}
