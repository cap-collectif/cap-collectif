<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Reader\CSV\Reader;
use Box\Spout\Reader\ReaderFactory;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateUsersFromCsvCommand extends ContainerAwareCommand
{
    const HEADERS = ['username', 'email', 'password'];
    private $filePath;
    private $delimiter;

    protected function configure()
    {
        $this->setName('capco:import:users')
            ->setDescription('Import users from a CSV file')
            ->addArgument(
                'filePath',
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
            ->addArgument('delimiter', InputArgument::OPTIONAL, ', or ;');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->filePath = $input->getArgument('filePath');
        $this->delimiter = $input->getArgument('delimiter');
        $userManager = $this->getContainer()->get('fos_user.user_manager');

        $rows = $this->getRows();

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
        $loop = 1;

        foreach ($rows as $row) {
            if (1 === $loop && !$this->isValidHeaders($row, $output)) {
                return $this->generateContentException($output);
            }

            if ($loop > 1 && $this->isValidRow($row, $output)) {
                $user = $userManager->createUser();
                $user->setUsername($row[0]);
                $user->setEmail(filter_var($row[1], FILTER_SANITIZE_EMAIL));
                $user->setPlainpassword($row[2]);
                $user->setEnabled(true);
                $userManager->updateUser($user);
                $progress->advance();
            }

            ++$loop;
        }

        $progress->finish();

        $output->writeln('<info>' . (\count($rows) - 1) . ' users successfully created.</info>');

        return 0;
    }

    /**
     * @throws \Box\Spout\Common\Exception\UnsupportedTypeException
     * @throws \Box\Spout\Reader\Exception\ReaderNotOpenedException
     * @throws \Box\Spout\Common\Exception\IOException
     */
    protected function getRows(): array
    {
        $rows = [];
        $reader = ReaderFactory::create(Type::CSV);
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
    }

    protected function isValidHeaders($row, OutputInterface $output): bool
    {
        if (self::HEADERS !== $row) {
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
        if (\count($row) < \count(self::HEADERS)) {
            $hasError = true;
        }

        if ('' === $row[0] || '' === $row[1] || '' === $row[2]) {
            $hasError = true;
        }

        if ($hasError) {
            return (bool) $this->generateContentException($output);
        }

        return true;
    }
}
