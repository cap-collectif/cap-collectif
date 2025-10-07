<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Enum\ExportHeaders;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\Repository\Debate\DebateAnonymousVoteRepository;
use Capco\AppBundle\Repository\DebateRepository;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Capco\AppBundle\Service\CsvDataFormatter;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Helper\TableSeparator;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Stopwatch\Stopwatch;
use Symfony\Contracts\Translation\TranslatorInterface;

class ExportDebateGroupedCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    private const BATCH_SIZE = 500;

    private const HEADER_KEYS = [
        ExportHeaders::EXPORT_PARTICIPANT_USER_ID,
        ExportHeaders::EXPORT_PARTICIPANT_USERNAME,
        ExportHeaders::EXPORT_PARTICIPANT_USER_EMAIL,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_INTERNAL_COMMUNICATION,
        ExportHeaders::EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL,
        ExportHeaders::EXPORT_PARTICIPANT_PHONE,
        ExportHeaders::EXPORT_PARTICIPANT_TYPE,
        ExportHeaders::EXPORT_PARTICIPANT_FIRSTNAME,
        ExportHeaders::EXPORT_PARTICIPANT_LASTNAME,
        ExportHeaders::EXPORT_PARTICIPANT_DATE_OF_BIRTH,
        ExportHeaders::EXPORT_PARTICIPANT_POSTAL_ADDRESS,
        ExportHeaders::EXPORT_PARTICIPANT_ZIP_CODE,
        ExportHeaders::EXPORT_PARTICIPANT_CITY,
        ExportHeaders::EXPORT_PARTICIPANT_PROFILE_URL,
        ExportHeaders::EXPORT_PARTICIPANT_IDENTIFICATION_CODE,
        ExportHeaders::EXPORT_VOTE_PUBLISHED_AT,
        ExportHeaders::EXPORT_VOTE_TYPE,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_PUBLISHED_AT,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_ACCOUNT,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_CONTENT,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_TYPE,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_VOTE_NUMBER,
    ];

    protected static $defaultName = 'capco:export:debate-grouped';

    // @phpstan-ignore-next-line
    private readonly string $projectRootDir;

    public function __construct(
        ExportUtils $exportUtils,
        private readonly Manager $toggleManager,
        string $projectRootDir,
        private readonly Stopwatch $stopwatch,
        private readonly EntityManagerInterface $em,
        private readonly TranslatorInterface $translator,
        private readonly DebateRepository $debateRepository,
        private readonly ContributionsFilePathResolver $contributionsFilePathResolver,
        private readonly UserUrlResolver $userUrlResolver,
        private readonly DebateVoteRepository $debateVoteRepository,
        private readonly DebateAnonymousVoteRepository $debateAnonymousVoteRepository,
        private readonly CsvDataFormatter $csvDataFormatter,
        private readonly LoggerInterface $logger,
    ) {
        parent::__construct($exportUtils);
        $this->projectRootDir = $projectRootDir;
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this
            ->setDescription(
                'Export Votes debate contributions, contains only contributions from users validated accounts.'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $style = new SymfonyStyle($input, $output);

        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $style->error('Please enable "export" feature to run this command');

            return Command::FAILURE;
        }

        $this->stopwatch->start('export_debate_grouped', 'Memory usage - Execution time');

        $debateCount = $this->debateRepository->count([]);

        if (0 === $debateCount) {
            $style->error('No debate found');

            return Command::SUCCESS;
        }

        $style->writeln(sprintf('Found %d debate(s)', $debateCount));
        $style->note('Starting the export.');

        $tableSummary = (new Table($output))
            ->setHeaderTitle('Export contributions')
            ->setStyle('box-double')
            ->setHeaders(['Debate', 'Debate(s) exported'])
        ;

        $translatedHeaderKeys = array_map(fn (string $header) => $this->translator->trans($header), self::HEADER_KEYS);

        $totalArguments = 0;

        $debates = $this->debateRepository->findAll();

        foreach ($debates as $debate) {
            $step = $debate->getStep();

            $path = $this->contributionsFilePathResolver->getGroupedExportPath($step);

            $handle = fopen($path, 'w');
            if (!$handle) {
                return Command::FAILURE;
            }

            fputcsv($handle, $translatedHeaderKeys);

            $arguments = $this->debateRepository->getDebateArgumentsConfirmedToIterable($debate);
            $anonymousArguments = $this->debateRepository->getDebateAnonymousArgumentsConfirmedToIterable($debate);

            $loopArgumentsCount = $this->debateRepository->getDebateArgumentsConfirmedCount($debate);
            $loopAnonymousArgumentsCount = $this->debateRepository->getDebateAnonymousArgumentsConfirmedCount($debate);

            $loopTotal = $loopArgumentsCount + $loopAnonymousArgumentsCount;

            if (0 === $loopTotal) {
                continue;
            }

            $progressBar = $style->createProgressBar($loopTotal);
            $progressBar->setFormat(
                "\n%current%/%max% processed argument(s)  [%bar%] %percent%%" .
                "\n\nTotal Arguments Processed: %total_processed%" .
                "\nMemory Used: %memory_used%\n"
            );
            $progressBar->setMessage('processed argument(s) ');
            $progressBar->setOverwrite(false);

            try {
                $argumentsCount = $this->insertArgumentsIntoCsv($arguments, $handle, $style);
                $anonymousArgumentsCount = $this->insertAnonymousArgumentsIntoCsv($anonymousArguments, $handle, $style);
            } catch (\Exception $e) {
                $this->logger->error(sprintf('An error occured during generation of csv file %s : %s', $path, $e->getMessage()));

                fclose($handle);
                unlink($path);

                continue;
            }

            $totalArguments += $argumentsCount;
            $totalArguments += $anonymousArgumentsCount;

            $memUse = round(memory_get_usage() / 1000000, 2) . 'MB';
            $style->writeln(sprintf('Total arguments Processed: %d (memory used: %s)', $totalArguments, $memUse));

            $progressBar->setMessage($memUse, 'memory_used');
            $progressBar->setMessage((string) $argumentsCount, 'total_processed');
            $progressBar->advance();
            $style->newLine(2);

            fclose($handle);

            $tableSummary->addRows([[$step->getTitle(), $loopTotal], new TableSeparator()]);
            $style->writeln("\n<info>Exported the CSV files grouped: {$path}</info>\n");

            if (file_exists($path)) {
                $this->executeSnapshot(
                    $input,
                    $output,
                    $step->getType() . '/' . $this->contributionsFilePathResolver->getFileName($step, ExportVariantsEnum::GROUPED)
                );
            }
        }

        $tableSummary->setFooterTitle('Total Proposals: ' . $totalArguments);
        $tableSummary->render();

        $eventInfo = $this->stopwatch->stop('export_debate_grouped')->__toString();
        $style->success(sprintf(
            "Command '%s' ended successfully. %s",
            self::$defaultName,
            $eventInfo
        ));

        return Command::SUCCESS;
    }

    /**
     * @param iterable<DebateArgument> $arguments
     * @param resource                 $handle
     */
    private function insertArgumentsIntoCsv(
        iterable $arguments,
        mixed $handle,
        SymfonyStyle $style
    ): int {
        $style->newLine(2);

        $argumentsCount = 0;

        foreach ($arguments as $argument) {
            /** @var User $author */
            $author = $argument->getAuthor();

            $vote = $this->debateVoteRepository->getDebateVoteByUser($author, $argument->getDebate());

            $csvData = [
                ExportHeaders::EXPORT_PARTICIPANT_USER_ID => $author->getId(),
                ExportHeaders::EXPORT_PARTICIPANT_USERNAME => $author->getUsername(),
                ExportHeaders::EXPORT_PARTICIPANT_USER_EMAIL => $author->getEmail(),
                ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_INTERNAL_COMMUNICATION => $this->csvDataFormatter->getReadableBoolean($author->isConsentExternalCommunication()),
                ExportHeaders::EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL => $this->csvDataFormatter->getReadableBoolean(false),
                ExportHeaders::EXPORT_PARTICIPANT_PHONE => $author->getPhone(),
                ExportHeaders::EXPORT_PARTICIPANT_TYPE => $author->getUserType()?->getName(),
                ExportHeaders::EXPORT_PARTICIPANT_FIRSTNAME => $author->getFirstName(),
                ExportHeaders::EXPORT_PARTICIPANT_LASTNAME => $author->getLastName(),
                ExportHeaders::EXPORT_PARTICIPANT_DATE_OF_BIRTH => $this->csvDataFormatter->getNullableDatetime($author->getDateOfBirth()),
                ExportHeaders::EXPORT_PARTICIPANT_POSTAL_ADDRESS => $author->getPostalAddress()?->getFormatted(),
                ExportHeaders::EXPORT_PARTICIPANT_ZIP_CODE => $author->getZipCode(),
                ExportHeaders::EXPORT_PARTICIPANT_CITY => $author->getCity(),
                ExportHeaders::EXPORT_PARTICIPANT_PROFILE_URL => $this->userUrlResolver->__invoke($author),
                ExportHeaders::EXPORT_PARTICIPANT_IDENTIFICATION_CODE => $author->getUserIdentificationCode()?->getIdentificationCode(),
                ExportHeaders::EXPORT_VOTE_PUBLISHED_AT => null !== $vote ? $this->csvDataFormatter->getNullableDatetime($vote->getPublishedAt()) : null,
                ExportHeaders::EXPORT_VOTE_TYPE => $vote?->getVoteTypeName(),
                ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_PUBLISHED_AT => $this->csvDataFormatter->getNullableDatetime($argument->getPublishedAt()),
                ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_ACCOUNT => $this->csvDataFormatter->getReadableBoolean(true),
                ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_CONTENT => $argument->getBodyText(),
                ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_TYPE => null !== $vote ? $this->translator->trans(ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_TYPES[$vote->getType()]) : null,
                ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_VOTE_NUMBER => $argument->getVotes()->count(),
            ];

            $hasBeenInserted = fputcsv($handle, array_values($csvData));

            if (!$hasBeenInserted) {
                throw new \RuntimeException(sprintf('An error occured while writing argument in the file : %s', json_encode($csvData)));
            }

            if (($argumentsCount % self::BATCH_SIZE) === 0) {
                $this->em->clear();
            }

            ++$argumentsCount;
        }

        return $argumentsCount;
    }

    /**
     * @param iterable<DebateAnonymousArgument> $anonymousArguments
     * @param resource                          $handle
     */
    private function insertAnonymousArgumentsIntoCsv(
        iterable $anonymousArguments,
        mixed $handle,
        SymfonyStyle $style
    ): int {
        $style->newLine(2);

        $anonymousArgumentsCount = 0;

        foreach ($anonymousArguments as $anonymousArgument) {
            $votes = $this->debateAnonymousVoteRepository->hydrateFromIds([$anonymousArgument->getDebate()->getId()]);
            $vote = $votes[0] ?? null;

            $csvData = [
                ExportHeaders::EXPORT_PARTICIPANT_USER_ID => null,
                ExportHeaders::EXPORT_PARTICIPANT_USERNAME => $anonymousArgument->getUsername(),
                ExportHeaders::EXPORT_PARTICIPANT_USER_EMAIL => $anonymousArgument->getEmail(),
                ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_INTERNAL_COMMUNICATION => $this->csvDataFormatter->getReadableBoolean($anonymousArgument->isConsentInternalCommunication()),
                ExportHeaders::EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL => $this->csvDataFormatter->getReadableBoolean(true),
                ExportHeaders::EXPORT_PARTICIPANT_PHONE => null,
                ExportHeaders::EXPORT_PARTICIPANT_TYPE => null,
                ExportHeaders::EXPORT_PARTICIPANT_FIRSTNAME => null,
                ExportHeaders::EXPORT_PARTICIPANT_LASTNAME => null,
                ExportHeaders::EXPORT_PARTICIPANT_DATE_OF_BIRTH => null,
                ExportHeaders::EXPORT_PARTICIPANT_POSTAL_ADDRESS => null,
                ExportHeaders::EXPORT_PARTICIPANT_ZIP_CODE => null,
                ExportHeaders::EXPORT_PARTICIPANT_CITY => null,
                ExportHeaders::EXPORT_PARTICIPANT_PROFILE_URL => null,
                ExportHeaders::EXPORT_PARTICIPANT_IDENTIFICATION_CODE => null,
                ExportHeaders::EXPORT_VOTE_PUBLISHED_AT => null !== $vote ? $this->csvDataFormatter->getNullableDatetime($vote->getPublishedAt()) : null,
                ExportHeaders::EXPORT_VOTE_TYPE => $vote?->getVoteType(),
                ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_PUBLISHED_AT => $this->csvDataFormatter->getNullableDatetime($anonymousArgument->getPublishedAt()),
                ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_AUTHOR_ACCOUNT => $this->csvDataFormatter->getReadableBoolean(false),
                ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_CONTENT => $anonymousArgument->getBodyText(),
                ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_TYPE => $this->translator->trans(ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_TYPES[$anonymousArgument->getType()]),
                ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENT_VOTE_NUMBER => $anonymousArgument->getVotes()->count(),
            ];

            $hasBeenInserted = fputcsv($handle, array_values($csvData));

            if (!$hasBeenInserted) {
                throw new \RuntimeException(sprintf('An error occured while writing argument in the file : %s', json_encode($csvData)));
            }

            if (($anonymousArgumentsCount % self::BATCH_SIZE) === 0) {
                $this->em->clear();
            }

            ++$anonymousArgumentsCount;
        }

        return $anonymousArgumentsCount;
    }
}
