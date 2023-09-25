<?php

namespace Capco\AppBundle\Command\Elasticsearch;

use Capco\AppBundle\Elasticsearch\IndexBuilder;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ConfirmationQuestion;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Process\Process;

class CleanIndexCommand extends Command
{
    private const DEFAULT_MAX_INDICES_KEPT = 3;
    private const ACTIONS = [
        'keep' => 'kept',
        'delete' => 'deleted',
    ];
    private const EMOJIS = [
        'ecoFriendly' => ' ♻️',
        'wasteBasket' => ' 🗑️',
    ];

    protected IndexBuilder $indexManager;
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
            ->addArgument(
                'numberOfIndicesKept',
                InputArgument::OPTIONAL,
                'set this argument to keep "n" index during the clean',
                self::DEFAULT_MAX_INDICES_KEPT
            )
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

        $numberOfIndicesKept = (int) $input->getArgument('numberOfIndicesKept');
        $io = new SymfonyStyle($input, $output);

        if (0 === $numberOfIndicesKept || 0 > $numberOfIndicesKept) {
            $io->warning('You must keep at least 1 index, Bye!');

            return 0;
        }

        if (1 === $numberOfIndicesKept) {
            $answer = $io->askQuestion(new ConfirmationQuestion('Do you want to keep only the last index up to date and LIVE?', false));
            if (!$answer) {
                $io->warning('Clean indices abort, Bye!');

                return 0;
            }
        }

        $io->note('By default during the clean of indices you will keep 3 last indices starting from the most recent one');
        $indices = $this->indexManager->cleanOldIndices($numberOfIndicesKept);

        if ([] === $indices) {
            $io->warning('Nothing to clean all is already up-to-date!');

            return 0;
        }

        list($indicesNamesDeleted, $indicesNamesKept) = $indices;

        $this->formatOutput($indicesNamesKept, $io);
        $this->formatOutput($indicesNamesDeleted, $io, self::ACTIONS['delete']);

        return 0;
    }

    private function formatOutput(array $indices, SymfonyStyle $io, string $action = self::ACTIONS['keep']): void
    {
        $countIndices = \count($indices);
        $wordingAction = (self::ACTIONS['keep'] === $action) ? self::ACTIONS['keep'] : self::ACTIONS['delete'];
        $wordingIndices = ($countIndices > 1) ? ' indices' : ' index';
        $emoji = (self::ACTIONS['keep'] === $action) ? self::EMOJIS['ecoFriendly'] : self::EMOJIS['wasteBasket'];
        $color = (self::ACTIONS['keep'] === $action) ? 'green' : 'red';

        if (self::ACTIONS['keep'] === $action) {
            $io->block('A TOTAL OF ' . $countIndices . $wordingIndices . ' were kept!', null, 'bg=' . $color);
            $io->block('INDEX LIVE: ' . $indices[0], 'KEEP', 'bg=green', ' ', true);
            $countIndices = $countIndices - 1;
            unset($indices[0]);
        }

        $indices = array_map(fn ($item) => 'Index: ' . $item, $indices);
        if (0 !== $countIndices) {
            $io->block(
                $countIndices . ' old' . $wordingIndices . ' has been ' . $wordingAction . $emoji,
                (self::ACTIONS['keep'] === $action) ? 'KEEP' : 'DELETE',
                'bg=' . $color,
                ' ',
                true
            );

            $io->block(
                implode(\PHP_EOL, $indices),
                null,
                'bg=' . $color . ';options=bold',
                ' ',
                true
            );
        }
    }
}
