<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Reader\Common\Creator\ReaderEntityFactory;
use Box\Spout\Reader\CSV\Reader;
use Capco\AppBundle\Helper\ConvertCsvToArray;
use FOS\UserBundle\Model\UserManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CreateUsersFromCsvCommand extends Command
{
    const HEADERS = ['username', 'email', 'password'];
    protected $filePath;
    protected $delimiter;
    protected UserManagerInterface $userManager;
    protected ConvertCsvToArray $csvReader;

    public function __construct(
        ?string $name,
        UserManagerInterface $userManager,
        ConvertCsvToArray $csvReader
    ) {
        $this->userManager = $userManager;
        $this->csvReader = $csvReader;
        parent::__construct($name);
    }

    protected function configure()
    {
        $this->setDescription('Import users from a CSV file')
            ->addArgument(
                'filePath',
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
            ->addOption(
                'delimiter',
                'd',
                InputOption::VALUE_OPTIONAL,
                'Delimiter used in csv',
                ';'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->filePath = $input->getArgument('filePath');
        $this->delimiter = $input->getOption('delimiter');

        $rows = $this->csvReader->convert($this->filePath);

        $count = \count($rows);

        if (0 === $count) {
            $output->writeln(
                '<error>Your file with path ' .
                    $this->filePath .
                    ' was not found or no user was found in your file. Please verify your path and file\'s content.</error>'
            );
            $output->writeln('<error>Import cancelled. No user was created.</error>');

            return 1;
        }

        $progress = new ProgressBar($output, $count - 1);
        $progress->start();

        $this->loopRows($rows, $output, $progress);

        $output->writeln('<info>' . \count($rows) . ' users successfully created.</info>');

        return 0;
    }

    protected function loopRows($rows, $output, $progress): void
    {
        $loop = 1;

        foreach ($rows as $row) {
            if ($this->isValidRow($row, $output)) {
                $this->createUser($row);
                $progress->advance();
            }

            ++$loop;
        }
    }

    protected function createUser(array $row): void
    {
        $user = $this->userManager->createUser();
        $user->setUsername($row['username']);
        $user->setEmail(filter_var($row['email'], \FILTER_SANITIZE_EMAIL));
        $user->setPlainpassword($row['password']);
        $user->setEnabled(true);
        $this->userManager->updateUser($user);
    }

    /**
     * @throws \Box\Spout\Common\Exception\UnsupportedTypeException
     * @throws \Box\Spout\Reader\Exception\ReaderNotOpenedException
     * @throws \Box\Spout\Common\Exception\IOException
     */
    protected function getRows(): array
    {
        $rows = [];
        $reader = ReaderEntityFactory::createCSVReader();
        $reader->setFieldDelimiter($this->delimiter ?? ';');
        $reader->open($this->filePath);
        if ($reader instanceof Reader) {
            foreach ($reader->getSheetIterator() as $sheet) {
                foreach ($sheet->getRowIterator() as $row) {
                    $rows[] = $row;
                }
            }

            return $rows;
        }

        return $rows;
    }

    protected function isValidHeaders($row, OutputInterface $output): bool
    {
        if ($this::HEADERS !== $row) {
            $output->writeln('<error>Error headers not correct</error>');

            return false;
        }

        return true;
    }

    protected function generateContentException(OutputInterface $output): int
    {
        $output->writeln('<error>Content of your file is not valid.</error>');
        $output->writeln('<error>Import cancelled. No user was created.</error>');

        return 1;
    }

    protected function isValidRow($row, OutputInterface $output): bool
    {
        $hasError = false;
        if (\count($row) < \count($this::HEADERS)) {
            $hasError = true;
        }

        foreach ($this::HEADERS as $header) {
            if (empty($row[$header])) {
                $hasError = true;
            }
        }

        if ($hasError) {
            return (bool) $this->generateContentException($output);
        }

        return true;
    }
}
