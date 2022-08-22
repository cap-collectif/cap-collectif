<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\GraphQL\Mutation\AddProposalsFromCsvMutation;
use Capco\AppBundle\Import\ImportProposalsFromCsv;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\UserBundle\Repository\UserRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Command to execute specifically for IDF import of proposals.
 * First, users shall be imported by capco:import:idf-users
 * Second, images shall be copied on public repository and their url added as "media_url" in the import file.
 * Third, run the import with the csv import file and the proposal form to link the proposals.
 */
class ImportIDFProposalsFromCsvCommand extends Command
{
    protected static $defaultName = 'capco:import:idf-proposals-from-csv';
    protected ?ProposalForm $proposalForm;
    protected ProposalFormRepository $proposalFormRepository;
    protected ImportProposalsFromCsv $importProposalsFromCsv;
    protected LoggerInterface $logger;
    protected UserRepository $userRepository;

    protected array $headers;

    public function __construct(
        ProposalFormRepository $proposalFormRepository,
        ImportProposalsFromCsv $importProposalsFromCsv,
        UserRepository $userRepository,
        LoggerInterface $logger,
        ?string $name = null
    ) {
        parent::__construct($name);
        $this->importProposalsFromCsv = $importProposalsFromCsv;
        $this->proposalFormRepository = $proposalFormRepository;
        $this->userRepository = $userRepository;
        $this->logger = $logger;
    }

    protected function configure(): void
    {
        $this->setDescription('Import idf proposals from CSV file with specified proposal form id')
            ->addArgument(
                'filePath',
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
            ->addArgument(
                'proposal-form',
                InputArgument::REQUIRED,
                'Please provide the proposal form id where you want to import proposals.'
            )
            ->addOption('delimiter', 'd', InputOption::VALUE_OPTIONAL, 'Delimiter used in csv', ';')
            ->addOption('dryRun', 'dr', InputOption::VALUE_OPTIONAL, '', false)
            ->addOption('skipDuplicateLines', 'idl', InputOption::VALUE_OPTIONAL, '', false);
    }

    protected function execute(InputInterface $input, OutputInterface $output): ?int
    {
        $this->importProposalsFromCsv->setFilePath($input->getArgument('filePath'));
        $this->importProposalsFromCsv->setDelimiter($input->getOption('delimiter'));
        $dryRun = filter_var($input->getOption('dryRun'), \FILTER_VALIDATE_BOOLEAN);
        $skipDuplicateLines = filter_var(
            $input->getOption('skipDuplicateLines'),
            \FILTER_VALIDATE_BOOLEAN
        );
        $proposalFormId = $input->getArgument('proposal-form');
        $proposalForm = $this->proposalFormRepository->find($proposalFormId);
        if (!$proposalForm) {
            $output->writeln('<error>This proposal form doesnt exist</error>');

            return 1;
        }
        $this->importProposalsFromCsv->setProposalForm($proposalForm);

        try {
            $result = $this->importProposalsFromCsv->import(
                $dryRun,
                $skipDuplicateLines,
                true,
                $output
            );

            $output->writeln(
                '<info>' . $result['importableProposals'] . ' proposals are importable.</info>'
            );
            $output->writeln(
                '<info>' .
                    \count($result['importedProposals']) .
                    ' proposals successfully created.</info>'
            );
            $output->writeln(
                '<info>' .
                    array_sum($result['badLines']) .
                    ' bad data. Lines : ' .
                    implode(',', array_keys($result['badLines'])) .
                    '  are bad and not imported.</info>'
            );
            $output->writeln(
                '<info>Lines : ' .
                    implode(',', $result['duplicates']) .
                    ' already existent and not imported.</info>'
            );
            $output->writeln(
                '<info>' .
                    array_sum($result['mandatoryMissing']) .
                    ' mandatory fields missing. Lines : ' .
                    implode(',', array_keys($result['mandatoryMissing'])) .
                    ' missing somes required data and not imported.</info>'
            );

            return 0;
        } catch (\Exception $exception) {
            switch ($exception->getMessage()) {
                case AddProposalsFromCsvMutation::EMPTY_FILE:
                    $output->writeln(
                        '<error>Your file with path ' .
                            $input->getArgument('filePath') .
                            ' was not found or no proposal was found in your file. Please verify your path and file\'s content.</error>'
                    );
                    $output->writeln('<error>Import cancelled. No proposal was created.</error>');

                    return 1;
                case AddProposalsFromCsvMutation::BAD_DATA_MODEL:
                    $output->writeln('<error>CSV header is not valid</error>');
                    $output->writeln('<error>Import cancelled. No proposal was created.</error>');

                    return 1;
            }
            $this->logger->error($exception->getMessage());
            $output->writeln('<error>Something is wrong contact an administrator</error>' .  $exception->getMessage());

            return 1;
        }
    }
}
