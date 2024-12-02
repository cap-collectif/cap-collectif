<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Generator\DiffGenerator;
use Capco\AppBundle\Repository\OpinionModalRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ComputeDiffCommand extends Command
{
    public function __construct(
        ?string $name,
        private readonly EntityManagerInterface $em,
        private readonly OpinionVersionRepository $opinionVersionRepository,
        private readonly OpinionModalRepository $modalRepository,
        private readonly DiffGenerator $diffGenerator
    ) {
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
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $versions = $this->opinionVersionRepository->getAllIds();

        $progress = new ProgressBar($output, \count($versions));

        foreach ($versions as $versionId) {
            $version = $this->opinionVersionRepository->find($versionId);
            if ('' === $version->getDiff() || $input->getOption('force')) {
                $this->diffGenerator->generate($version);
                $this->em->flush();
            }
            $progress->advance();
        }
        $progress->finish();

        $modals = $this->modalRepository->findAll();
        $progress = new ProgressBar($output, \count($modals));
        foreach ($modals as $modal) {
            $this->diffGenerator->generate($modal);
            $this->em->flush();
            $progress->advance();
        }
        $progress->finish();

        $output->writeln('Computation completed');

        return 0;
    }
}
