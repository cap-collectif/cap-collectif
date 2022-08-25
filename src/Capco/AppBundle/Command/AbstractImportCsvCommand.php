<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Helper\ConvertCsvToArray;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

abstract class AbstractImportCsvCommand extends Command
{
    public const ERROR_NO_FILE = 'ERROR_NO_FILE';
    public const ERROR_EMPTY_FILE = 'ERROR_EMPTY_FILE';

    public const INPUT_FILE_PATH = 'filePath';
    public const INPUT_DELIMITER = 'delimiter';
    public const INPUT_DRY_RUN = 'dryRun';

    protected ConvertCsvToArray $csvReader;
    protected string $filePath = '';
    protected string $delimiter = ';';
    protected bool $dryRun = false;

    public function __construct(string $name, ConvertCsvToArray $csvReader)
    {
        parent::__construct($name);
        $this->csvReader = $csvReader;
    }

    abstract protected function getRowErrors(array &$row): array;

    abstract protected function importRow(array $row): void;

    abstract protected function handleRuntimeException(
        \RuntimeException $exception,
        OutputInterface $output
    ): int;

    abstract protected function successMessage(int $successCount, OutputInterface $output): int;

    protected function configure()
    {
        $this->setDescription('Import from a CSV file')
            ->addArgument(
                self::INPUT_FILE_PATH,
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
            ->addOption(
                self::INPUT_DELIMITER,
                'd',
                InputOption::VALUE_OPTIONAL,
                'Delimiter used in csv',
                ';'
            )
            ->addOption(
                self::INPUT_DRY_RUN,
                'dr',
                InputOption::VALUE_OPTIONAL,
                'True to test the file with no real import',
                false
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        try {
            $this->setInputs($input);
            $rows = $this->getRows();
            $count = \count($rows);
            $progress = new ProgressBar($output, $count - 1);
            $progress->start();
            $errors = $this->loopRows($rows, $progress);
            $progress->finish();
            $this->displayErrors($errors, $output);

            return $this->successMessage($count - \count($errors), $output);
        } catch (\RuntimeException $exception) {
            return $this->handleRuntimeException($exception, $output);
        }
    }

    protected function getRows(): array
    {
        $rows = $this->csvReader->convert($this->filePath, $this->delimiter);
        if (0 === \count($rows)) {
            throw new \RuntimeException(self::ERROR_EMPTY_FILE);
        }

        return $rows;
    }

    protected function loopRows(array $rows, ?ProgressBar $progressBar = null): array
    {
        $loop = 1;
        $errors = [];

        foreach ($rows as $row) {
            $rowErrors = $this->getRowErrors($row);
            if (empty($rowErrors)) {
                $this->importRow($row);
            } else {
                $errors[$loop] = $rowErrors;
            }
            if ($progressBar) {
                $progressBar->advance();
            }

            ++$loop;
        }

        return $errors;
    }

    protected function setInputs(InputInterface $input): void
    {
        $this->setFilePath($input);
        $this->delimiter = $input->getOption(self::INPUT_DELIMITER);
        $this->dryRun = $input->getOption(self::INPUT_DRY_RUN);
    }

    protected function displayErrors(array $errors, OutputInterface $output): void
    {
        if (!empty($errors)) {
            foreach ($errors as $line => $rowErrors) {
                $output->writeln(
                    "<error>On line ${line} : " . implode(', ', $rowErrors) . '</error>'
                );
            }
            $output->writeln('<error>' . \count($errors) . ' lines with errors</error>');
        }
    }

    private function setFilePath(InputInterface $input): void
    {
        $filePath = $input->getArgument(self::INPUT_FILE_PATH);
        if (!file_exists($filePath)) {
            throw new \RuntimeException(self::ERROR_NO_FILE);
        }
        $this->filePath = $filePath;
    }
}
