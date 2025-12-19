<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Stopwatch\Stopwatch;

#[AsCommand(
    name: 'capco:es:populate',
    description: 'Populates the current Elasticsearch indexes'
)]
class PopulateIndexCommand extends Command
{
    public function __construct(
        private readonly Manager $toggleManager,
        private readonly Indexer $indexer,
        private readonly Stopwatch $stopwatch
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('type', InputArgument::OPTIONAL, 'Populate only a specific type')
            ->addArgument('offset', InputArgument::OPTIONAL, 'Populate from a specific offset', 0)
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if (!$this->toggleManager->isActive(Manager::indexation)) {
            $io->error('Please enable "indexation" feature to run this command');

            return Command::FAILURE;
        }

        $io->info('Start indexing Elasticsearch.');
        $io->text(sprintf('Current index: %s', $this->indexer->getIndex()->getName()));

        $type = $input->getArgument('type');
        $offset = $input->getArgument('offset');

        try {
            $this->stopwatch->start('populate');

            if ($type) {
                $this->indexer->indexAllForType($type, $offset, $output, true);
            } else {
                $this->indexer->indexAll($output, true);
            }

            $this->indexer->finishBulk(true);
            $event = $this->stopwatch->stop('populate');

            $io->text(sprintf('Populate Elasticsearch duration: %ss', $event->getDuration() / 1000));
        } catch (\RuntimeException $e) {
            $io->error($e->getMessage());

            return Command::FAILURE;
        }

        $io->success('All the documents are LIVE!');

        return Command::SUCCESS;
    }
}
