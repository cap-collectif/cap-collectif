<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Symfony\Component\Process\Process;
use Symfony\Component\Console\Command\Command;
use Capco\AppBundle\Elasticsearch\IndexBuilder;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CleanIndexCommand extends Command
{
    protected $indexManager;

    public function __construct(IndexBuilder $indexManager)
    {
        $this->indexManager = $indexManager;
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName('capco:es:clean')
            ->setDescription('Clean old Indexes.')
            ->addOption(
                'all',
                false,
                InputOption::VALUE_NONE,
                'set this option to delete all indexes'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        if ($input->getOption('all')) {
            $job = new Process('curl -sS -XDELETE http://elasticsearch:9200/_all');
            echo $job->getCommandLine() . PHP_EOL;
            $job->mustRun();

            return 0;
        }

        $deleted = $this->indexManager->cleanOldIndices(1);

        foreach ($deleted as $delete) {
            $output->writeln(['Cleaned :' . $delete]);
        }

        return 0;
    }
}
