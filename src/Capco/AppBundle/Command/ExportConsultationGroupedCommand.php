<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\BatchProcessor;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Enum\ExportHeaders;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\GraphQL\Resolver\Argument\ArgumentUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Opinion\OpinionUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Service\CsvDataFormatter;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Helper\TableSeparator;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Stopwatch\Stopwatch;
use Symfony\Contracts\Translation\TranslatorInterface;

class ExportConsultationGroupedCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    public const STEP_FOLDER = 'consultation/';
    private const BATCH_SIZE = 100;

    private const HEADER_KEYS = [
        ExportHeaders::EXPORT_CONTRIBUTION_TYPE,
        ExportHeaders::EXPORT_CONTRIBUTION_AUTHOR_ID,
        ExportHeaders::EXPORT_PARTICIPANT_USERNAME,
        ExportHeaders::EXPORT_PARTICIPANT_USER_EMAIL,
        ExportHeaders::EXPORT_PARTICIPANT_CONSENT_INTERNAL_COMMUNICATION,
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
        ExportHeaders::EXPORT_CONTRIBUTION_ID,
        ExportHeaders::EXPORT_CONTRIBUTION_CONSULTATION_TITLE,
        ExportHeaders::EXPORT_CONTRIBUTION_SECTION_TITLE,
        ExportHeaders::EXPORT_CONTRIBUTION_TITLE,
        ExportHeaders::EXPORT_CONTRIBUTION_BODY_TEXT,
        ExportHeaders::EXPORT_CONTRIBUTION_URL,
        ExportHeaders::EXPORT_CONTRIBUTION_VOTES_COUNT,
        ExportHeaders::EXPORT_CONTRIBUTION_VOTES_COUNT_OK,
        ExportHeaders::EXPORT_CONTRIBUTION_VOTES_COUNT_MITIGE,
        ExportHeaders::EXPORT_CONTRIBUTION_VOTES_COUNT_NOK,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_FOR,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_AGAINST,
        ExportHeaders::EXPORT_CONTRIBUTION_VOTES_ID,
        ExportHeaders::EXPORT_CONTRIBUTION_VOTES_RELATED_ID,
        ExportHeaders::EXPORT_CONTRIBUTION_VOTES_VALUE,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_ID,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_RELATED_ID,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_TYPE,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_BODY,
        ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_URL,
        ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_ID,
        ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_TITLE,
        ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_EXPLANATION,
        ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_BODY_TEXT,
        ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT,
        ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_OK,
        ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_MITIGE,
        ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_NOK,
    ];

    private const EXPORT_CONTRIBUTION_TYPES = [
        Opinion::class => ExportHeaders::EXPORT_CONTRIBUTION_TYPE_OPINION,
        OpinionVote::class => ExportHeaders::EXPORT_CONTRIBUTION_TYPE_OPINION_VOTE,
        Argument::class => ExportHeaders::EXPORT_CONTRIBUTION_TYPE_ARGUMENT,
        OpinionVersion::class => ExportHeaders::EXPORT_CONTRIBUTION_TYPE_OPINION_VERSION,
    ];

    protected static $defaultName = 'capco:export:consultation:grouped';

    public function __construct(
        ExportUtils $exportUtils,
        private readonly Manager $toggleManager,
        /** @phpstan-ignore-next-line */
        private readonly string $projectRootDir,
        private readonly Stopwatch $stopwatch,
        private readonly EntityManagerInterface $em,
        private readonly TranslatorInterface $translator,
        private readonly ContributionsFilePathResolver $contributionsFilePathResolver,
        private readonly UserUrlResolver $userUrlResolver,
        private readonly CsvDataFormatter $csvDataFormatter,
        private readonly ConsultationStepRepository $consultationStepRepository,
        private readonly OpinionRepository $opinionRepository,
        private readonly OpinionUrlResolver $opinionUrlResolver,
        private readonly ArgumentUrlResolver $argumentUrlResolver,
        private readonly BatchProcessor $batchProcessor,
    ) {
        parent::__construct($exportUtils);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this
            ->setDescription(
                'Export Votes consultation contributions, contains only contributions from users validated accounts.'
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

        $this->stopwatch->start('export_consultation_grouped', 'Memory usage - Execution time');

        $stepCount = $this->consultationStepRepository->count([]);

        if (0 === $stepCount) {
            $style->error('No consultation step found');

            return Command::SUCCESS;
        }

        $style->writeln(sprintf('Found %d consultation(s)', $stepCount));
        $style->note('Starting the export.');

        $tableSummary = (new Table($output))
            ->setHeaderTitle('Export contributions')
            ->setStyle('box-double')
            ->setHeaders(['Consultation', 'Contribution(s) exported', 'File path'])
        ;

        $consultationSteps = $this->consultationStepRepository->findAllConsultations();

        foreach ($consultationSteps as $consultationStep) {
            $contributionCount = $this->processConsultationStep($consultationStep, $style);

            if ($contributionCount > 0) {
                $path = $this->contributionsFilePathResolver->getGroupedExportPath($consultationStep);

                $tableSummary->addRows([
                    [$consultationStep->getTitle(), $contributionCount, $path],
                    new TableSeparator(),
                ]);

                $this->executeSnapshot(
                    $input,
                    $output,
                    self::STEP_FOLDER . $this->contributionsFilePathResolver->getFileName(
                        $consultationStep,
                        ExportVariantsEnum::GROUPED
                    )
                );
            }

            $this->em->clear();
        }

        $tableSummary->render();

        $eventInfo = $this->stopwatch->stop('export_consultation_grouped')->__toString();
        $style->success(sprintf(
            "Command '%s' ended successfully. %s",
            self::$defaultName,
            $eventInfo
        ));

        return Command::SUCCESS;
    }

    private function processConsultationStep(ConsultationStep $consultationStep, SymfonyStyle $style): int
    {
        $opinionCount = $this->opinionRepository->getOpinionsByConsultationStepWithUserConfirmedCount($consultationStep);

        if (0 === $opinionCount) {
            return 0;
        }

        $path = $this->contributionsFilePathResolver->getGroupedExportPath($consultationStep);
        $handle = fopen($path, 'w');

        if (!$handle) {
            throw new \RuntimeException(sprintf('Cannot open file for writing: %s', $path));
        }

        $translatedHeaderKeys = array_map(fn ($header) => $this->translator->trans($header), self::HEADER_KEYS);

        fputcsv($handle, $translatedHeaderKeys);

        $totalContributions = 0;
        $processed = 0;

        $opinions = $this->opinionRepository->getOpinionsByConsultationStepWithUserConfirmedIterator($consultationStep);

        foreach ($opinions as $opinion) {
            $contributions = $this->getAllContributionsFromOpinionByBatch($opinion, $style);
            $totalContributions += \count($contributions);

            foreach ($contributions as $contribution) {
                $opinionArray = $this->buildRowData($contribution, $consultationStep);

                if ($opinionArray) {
                    fputcsv($handle, array_values($opinionArray));
                }
            }

            ++$processed;

            if (0 === $processed % self::BATCH_SIZE) {
                $this->em->clear();
                $style->writeln(sprintf('Processed %d opinions...', $processed));
            }
        }

        fclose($handle);

        return $totalContributions;
    }

    /**
     * @return null|array<string, mixed>
     */
    private function buildRowData(
        Argument|Opinion|OpinionVersion|OpinionVote $contribution,
        ConsultationStep $consultationStep
    ): ?array {
        $opinionArray = array_fill_keys(self::HEADER_KEYS, null);
        $contributionTypeTitle = self::EXPORT_CONTRIBUTION_TYPES[$contribution::class];

        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_TYPE] = $this->translator->trans($contributionTypeTitle);

        /** @var User $author */
        $author = $contribution->getAuthor();
        $opinionArray = $this->setParticipantData($opinionArray, $author);

        return match ($contribution::class) {
            Opinion::class => $this->setProposalData($opinionArray, $contribution, $consultationStep),
            OpinionVote::class => $this->setOpinionVoteData($opinionArray, $contribution),
            OpinionVersion::class => $this->setVersionData($opinionArray, $contribution, $consultationStep),
            Argument::class => $this->setArgumentData($opinionArray, $contribution),
            default => null
        };
    }

    /**
     * @param array<string, mixed> $opinionArray
     *
     * @return array<string, mixed>
     */
    private function setProposalData(array $opinionArray, Opinion $opinion, ConsultationStep $consultationStep): array
    {
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_ID] = $opinion->getId();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_CONSULTATION_TITLE] = $consultationStep->getTitle();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_SECTION_TITLE] = $opinion->getOpinionType()?->getTitle();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_TITLE] = $opinion->getTitle();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_BODY_TEXT] = $opinion->getBodyText();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_URL] = $this->opinionUrlResolver->__invoke($opinion);

        $votes = $opinion->getVotes();
        $arguments = $opinion->getArguments();

        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_COUNT] = $votes->count();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_COUNT_OK] = $this->getArgumentCountPerOpinion($arguments, $consultationStep, 1);
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_COUNT_MITIGE] = $this->getArgumentCountPerOpinion($arguments, $consultationStep, 0);
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_COUNT_NOK] = $this->getArgumentCountPerOpinion($arguments, $consultationStep, -1);

        $arguments = $opinion->getArguments();

        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT] = $arguments->count();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_FOR] = $this->getArgumentCountPerOpinion($arguments, $consultationStep, 1);
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_AGAINST] = $this->getArgumentCountPerOpinion($arguments, $consultationStep, 0);

        return $opinionArray;
    }

    private function getArgumentCountPerOpinion(Collection $arguments, ConsultationStep $consultationStep, int $filterValue): int
    {
        $filterClosure = fn (Argument $argument) => null !== $argument->getStep()
            && $argument->getStep()->getId() === $consultationStep->getId()
            && $argument->isPublished()
            && $argument->getType() === $filterValue;

        return $arguments->filter($filterClosure)->count();
    }

    /**
     * @param array<string, mixed> $opinionArray
     *
     * @return array<string, mixed>
     */
    private function setVersionData(array $opinionArray, OpinionVersion $version, ConsultationStep $consultationStep): array
    {
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_ID] = $version->getId();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_TITLE] = $version->getTitle();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_EXPLANATION] = $version->getComment();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_BODY_TEXT] = $version->getBodyText();

        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT] = $version->getVotes()->count();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_OK] = $this->getVoteCountPerOpinionVersion($version, $consultationStep, 1);
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_MITIGE] = $this->getVoteCountPerOpinionVersion($version, $consultationStep, 0);
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_NOK] = $this->getVoteCountPerOpinionVersion($version, $consultationStep, -1);

        return $opinionArray;
    }

    /**
     * @param array<string, mixed> $opinionArray
     *
     * @return array<string, mixed>
     */
    private function setParticipantData(array $opinionArray, User $author): array
    {
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_AUTHOR_ID] = $author->getId();
        $opinionArray[ExportHeaders::EXPORT_PARTICIPANT_USERNAME] = $author->getUsername();
        $opinionArray[ExportHeaders::EXPORT_PARTICIPANT_USER_EMAIL] = $author->getEmail();
        $opinionArray[ExportHeaders::EXPORT_PARTICIPANT_CONSENT_INTERNAL_COMMUNICATION] = $this->csvDataFormatter->getReadableBoolean($author->isConsentInternalCommunication());
        $opinionArray[ExportHeaders::EXPORT_PARTICIPANT_PHONE] = $author->getPhone();
        $opinionArray[ExportHeaders::EXPORT_PARTICIPANT_TYPE] = $author->getUserType()?->getName();
        $opinionArray[ExportHeaders::EXPORT_PARTICIPANT_FIRSTNAME] = $author->getFirstname();
        $opinionArray[ExportHeaders::EXPORT_PARTICIPANT_LASTNAME] = $author->getLastname();
        $opinionArray[ExportHeaders::EXPORT_PARTICIPANT_DATE_OF_BIRTH] = $this->csvDataFormatter->getNullableDatetime($author->getDateOfBirth());
        $opinionArray[ExportHeaders::EXPORT_PARTICIPANT_POSTAL_ADDRESS] = $author->getPostalAddress()?->getFormatted();
        $opinionArray[ExportHeaders::EXPORT_PARTICIPANT_ZIP_CODE] = $author->getZipCode();
        $opinionArray[ExportHeaders::EXPORT_PARTICIPANT_CITY] = $author->getCity();
        $opinionArray[ExportHeaders::EXPORT_PARTICIPANT_PROFILE_URL] = $this->userUrlResolver->__invoke($author);
        $opinionArray[ExportHeaders::EXPORT_PARTICIPANT_IDENTIFICATION_CODE] = $author->getUserIdentificationCode()?->getIdentificationCode();

        return $opinionArray;
    }

    /**
     * @param array<string, mixed> $opinionArray
     *
     * @return array<string, mixed>
     */
    private function setArgumentData(array $opinionArray, Argument $argument): array
    {
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_ID] = $argument->getId();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_RELATED_ID] = $argument->getRelated()->getId();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_TYPE] = $this->translator->trans($argument->getTypeAsString());
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_BODY] = $argument->getBody();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_URL] = $this->argumentUrlResolver->__invoke($argument);

        return $opinionArray;
    }

    /**
     * @param array<string, mixed> $opinionArray
     *
     * @return array<string, mixed>
     */
    private function setOpinionVoteData(array $opinionArray, OpinionVote $contribution): array
    {
        $voteValue = OpinionVote::$voteTypesLabels[$contribution->getValue()];

        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_ID] = $contribution->getId();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_RELATED_ID] = $contribution->getRelated()->getId();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_VALUE] = $this->translator->trans($voteValue);

        return $opinionArray;
    }

    private function getVoteCountPerOpinionVersion(OpinionVersion $opinionVersion, ConsultationStep $consultationStep, int $filterValue): int
    {
        $filterClosure = fn (OpinionVersionVote $vote) => null !== $vote->getStep()
            && $vote->getStep()->getId() === $consultationStep->getId()
            && $vote->getIsAccounted()
            && ($vote->getValue() === $filterValue);

        return $opinionVersion->getVotes()->filter($filterClosure)->count();
    }

    /**
     * @return Argument[]|Opinion[]|OpinionVersion[]|OpinionVote[]
     */
    private function getAllContributionsFromOpinionByBatch(Opinion $opinion, SymfonyStyle $style): array
    {
        /** @var OpinionVote[] $opinionVotes */
        $opinionVotes = $this->batchProcessor->processQueryInBatches(
            OpinionVote::class,
            'ov',
            'ov.opinion = :opinion AND ov.published = true AND u.confirmationToken IS NULL',
            ['opinion' => $opinion],
            5000,
            $style,
            null,
            'ov.user',
            'u',
        );

        /** @var Argument[] $opinionArguments */
        $opinionArguments = $this->batchProcessor->processQueryInBatches(
            Argument::class,
            'a',
            'a.opinion = :opinion AND a.published = true AND au.confirmationToken IS NULL',
            ['opinion' => $opinion],
            5000,
            $style,
            null,
            'a.author',
            'au',
        );

        /** @var OpinionVersion[] $opinionVersions */
        $opinionVersions = $this->batchProcessor->processQueryInBatches(
            OpinionVersion::class,
            'ov',
            'ov.parent = :opinion AND ov.published = true AND a.confirmationToken IS NULL',
            ['opinion' => $opinion],
            5000,
            $style,
            null,
            'ov.author',
            'a',
        );

        $contributions = [
            [$opinion],
            $opinionVotes,
            $opinionArguments,
            $opinionVersions,
        ];

        foreach ($contributions as $contributionType => $contributionArray) {
            $countContributionsByType = \count($contributionArray);
            if (0 !== $countContributionsByType) {
                $style->writeln(sprintf('Batch processing complete, processed %d %s.', $countContributionsByType, $contributionType));
            }
        }

        return array_merge(
            [$opinion],
            $opinionVotes,
            $opinionArguments,
            $opinionVersions,
        );
    }
}
