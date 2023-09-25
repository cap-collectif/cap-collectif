<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Capco\AppBundle\Elasticsearch\IndexBuilder;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Process\Process;

class CleanIndexCommand extends Command
{
    protected $indexManager;
    private array $config;

    public function __construct(IndexBuilder $indexManager, array $config)
    {
        $this->indexManager = $indexManager;
        $this->config = $config;
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
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        if ($input->getOption('all')) {
            $job = Process::fromShellCommandline(
                sprintf('curl -sS -XDELETE http://%s:%s/_all', $this->config['host'], $this->config['port'])
            );
            echo $job->getCommandLine() . \PHP_EOL;
            $job->mustRun();

            return 0;
        }

        $indexNamesDeleted = $this->indexManager->cleanOldIndices();
        if ([] === $indexNamesDeleted) {
            $output->writeln('<bg=yellow>Nothing to clean all is up-to-date !</>');

            return 0;
        }

        $emojiEcoFriendly = '♻️';
        $output->writeln('<bg=green;options=bold>' . \count($indexNamesDeleted) . ' old index(s)</><bg=green> has been</><bg=green;options=bold> deleted ' . $emojiEcoFriendly . '</>');
        foreach ($indexNamesDeleted as $indexNameDeleted) {
            $output->writeln(['<bg=green>Index: <bg=green;options=bold>' . $indexNameDeleted . '</></>']);
        }

        return 0;
    }
}
