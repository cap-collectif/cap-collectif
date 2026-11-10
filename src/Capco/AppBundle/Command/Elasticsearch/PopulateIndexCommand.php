<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
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
        private readonly Stopwatch $stopwatch,
        private readonly GlobalIdResolver $globalIdResolver
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('type', InputArgument::OPTIONAL, 'Populate only a specific type')
            ->addArgument('offset', InputArgument::OPTIONAL, 'Populate from a specific offset', 0)
            ->addOption('id', null, InputOption::VALUE_REQUIRED, 'Synchronize one document by database ID, UUID or GraphQL Global ID, deleting it if absent or non-indexable (requires type; incompatible with offset)')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        return $this->indexer->withIndexingFiltersDisabled(fn (): int => $this->populate($input, $output));
    }

    private function populate(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $type = $input->getArgument('type');
        $offset = $input->getArgument('offset');
        $id = $input->getOption('id');

        if (null !== $id && (null === $type || '' === trim((string) $id) || 0 !== (int) $offset)) {
            $io->error('The --id option requires a type and a non-empty ID, and cannot be combined with an offset.');

            return Command::INVALID;
        }

        $classes = $type ? $this->indexer->getClassesToIndex() : [];
        if ($type && !isset($classes[$type])) {
            $io->error(sprintf('Unknown Elasticsearch type "%s". Available types: %s.', $type, implode(', ', array_keys($classes))));

            return Command::INVALID;
        }

        if (!$this->toggleManager->isActive(Manager::indexation)) {
            $io->error('Please enable "indexation" feature to run this command');

            return Command::FAILURE;
        }

        $io->info('Start indexing Elasticsearch.');
        $io->text(sprintf('Current index: %s', $this->indexer->getIndex()->getName()));

        try {
            $this->stopwatch->start('populate');

            if (null !== $id) {
                $decodedId = GlobalIdResolver::getDecodedId((string) $id);
                if (\is_array($decodedId)) {
                    $object = $this->globalIdResolver->resolveGlobalIdForClass($decodedId, $classes[$type]);
                    $id = $decodedId['id'];
                    $this->indexer->indexResolvedObject($classes[$type], $id, $object);
                } else {
                    $this->indexer->index($classes[$type], $id);
                }

                $io->text(sprintf('Synchronizing %s with ID %s.', $type, $id));
            } elseif ($type) {
                $this->indexer->indexAllForType($type, $offset, $output, true);
            } else {
                $this->indexer->indexAll($output, true);
            }

            $this->indexer->finishBulk(null === $id);
            $event = $this->stopwatch->stop('populate');

            $io->text(sprintf('Populate Elasticsearch duration: %ss', $event->getDuration() / 1000));
        } catch (\InvalidArgumentException $e) {
            $io->error($e->getMessage());
            $this->stopwatch->stop('populate');

            return Command::INVALID;
        } catch (\RuntimeException $e) {
            $io->error($e->getMessage());

            return Command::FAILURE;
        }

        $io->success('All the documents are LIVE!');

        return Command::SUCCESS;
    }
}
