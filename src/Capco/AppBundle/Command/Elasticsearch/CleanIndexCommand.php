<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Capco\AppBundle\Elasticsearch\IndexBuilder;
use Symfony\Component\Console\Command\Command;
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
        $this->setName('capco:es:clean')->setDescription('Clean old Indexes.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $deleted = $this->indexManager->cleanOldIndices(1);

        foreach ($deleted as $delete) {
            $output->writeln(['Cleaned :' . $delete]);
        }

        return 0;
    }
}
