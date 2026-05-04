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
use Capco\AppBundle\Utils\Text;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Helper\TableSeparator;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
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
        OpinionVersionVote::class => 'export_contribution_type_opinion_version_vote',
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
        $this->addOption(name: 'stepId', mode: InputOption::VALUE_REQUIRED, description: 'Only generate this step.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $style = new SymfonyStyle($input, $output);

        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $style->error('Please enable "export" feature to run this command');

            return Command::FAILURE;
        }

        $this->stopwatch->start('export_consultation_grouped', 'Memory usage - Execution time');

        $consultationSteps = null;
        if ($input->getOption('stepId')) {
            $step = $this->consultationStepRepository->find($input->getOption('stepId'));
            $consultationSteps = $step ? [$step] : [];
        }

        $stepCount = $consultationSteps ? \count($consultationSteps) : $this->consultationStepRepository->count([]);

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
        $delimiterOption = $input->getOption('delimiter');
        $delimiter = \is_string($delimiterOption) && '' !== $delimiterOption
            ? $delimiterOption
            : self::DEFAULT_CSV_DELIMITER;

        $consultationSteps ??= $this->consultationStepRepository->findAllConsultations();

        foreach ($consultationSteps as $consultationStep) {
            $contributionCount = $this->processConsultationStep($consultationStep, $style, $delimiter);

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

    private function processConsultationStep(
        ConsultationStep $consultationStep,
        SymfonyStyle $style,
        string $delimiter
    ): int {
        $opinionCount = $this->opinionRepository->getOpinionsByConsultationStepWithUserConfirmedCount($consultationStep);

        if (0 === $opinionCount) {
            return 0;
        }

        $path = $this->contributionsFilePathResolver->getGroupedExportPath($consultationStep);
        $this->ensureExportDirectory($path);
        $handle = fopen($path, 'w');

        if (!$handle) {
            throw new \RuntimeException(sprintf('Cannot open file for writing: %s', $path));
        }

        $translatedHeaderKeys = array_map(fn ($header) => $this->translator->trans($header), self::HEADER_KEYS);

        $this->writeUtf8Bom($handle);
        fputcsv($handle, $translatedHeaderKeys, $delimiter);

        $totalContributions = 0;
        $processed = 0;

        $opinions = $this->opinionRepository->getOpinionsByConsultationStepWithUserConfirmedIterator($consultationStep);

        foreach ($opinions as $opinion) {
            if ($opinion->isTrashed()) {
                continue;
            }

            $contributions = $this->getAllContributionsFromOpinionByBatch($opinion, $style);
            $totalContributions += \count($contributions);

            foreach ($contributions as $contribution) {
                $opinionArray = $this->buildRowData($contribution, $consultationStep);

                if ($opinionArray) {
                    fputcsv($handle, array_values($opinionArray), $delimiter);
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
        Argument|Opinion|OpinionVersion|OpinionVersionVote|OpinionVote $contribution,
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
            OpinionVersionVote::class => $this->setOpinionVoteData($opinionArray, $contribution),
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

        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_COUNT] = $this->getVoteCountPerOpinion($opinion, $consultationStep);
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_COUNT_OK] = $this->getVoteCountPerOpinion($opinion, $consultationStep, OpinionVote::VOTE_OK);
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_COUNT_MITIGE] = $this->getVoteCountPerOpinion($opinion, $consultationStep, OpinionVote::VOTE_MITIGE);
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_COUNT_NOK] = $this->getVoteCountPerOpinion($opinion, $consultationStep, OpinionVote::VOTE_NOK);

        $arguments = $opinion->getArguments();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT] = $this->getArgumentCountPerOpinion($arguments, $consultationStep);
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_FOR] = $this->getArgumentCountPerOpinion($arguments, $consultationStep, Argument::TYPE_FOR);
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_AGAINST] = $this->getArgumentCountPerOpinion($arguments, $consultationStep, Argument::TYPE_AGAINST);

        return $opinionArray;
    }

    private function getVoteCountPerOpinion(Opinion $opinion, ConsultationStep $consultationStep, ?int $filterValue = null): int
    {
        $filterClosure = fn (OpinionVote $vote) => null !== $vote->getStep()
            && $vote->getStep()->getId() === $consultationStep->getId()
            && $vote->getIsAccounted()
            && (null === $filterValue || $vote->getValue() === $filterValue);

        return $opinion->getVotes()->filter($filterClosure)->count();
    }

    private function getArgumentCountPerOpinion(
        Collection $arguments,
        ConsultationStep $consultationStep,
        ?int $filterValue = null
    ): int {
        $filterClosure = fn (Argument $argument) => null !== $argument->getStep()
            && $argument->getStep()->getId() === $consultationStep->getId()
            && $argument->isPublished()
            && !$argument->isTrashed()
            && (null === $filterValue || $argument->getType() === $filterValue);

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
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_EXPLANATION] = Text::htmlToString((string) $version->getComment());
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_BODY_TEXT] = $version->getBodyText();

        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT] = $this->getVoteCountPerOpinionVersion($version, $consultationStep);
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_OK] = $this->getVoteCountPerOpinionVersion($version, $consultationStep, OpinionVersionVote::VOTE_OK);
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_MITIGE] = $this->getVoteCountPerOpinionVersion($version, $consultationStep, OpinionVersionVote::VOTE_MITIGE);
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_NOK] = $this->getVoteCountPerOpinionVersion($version, $consultationStep, OpinionVersionVote::VOTE_NOK);

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
    private function setOpinionVoteData(array $opinionArray, OpinionVote|OpinionVersionVote $contribution): array
    {
        $voteTypesLabels = $contribution instanceof OpinionVersionVote
            ? OpinionVersionVote::$voteTypesLabels
            : OpinionVote::$voteTypesLabels;
        $voteValue = $voteTypesLabels[$contribution->getValue()];

        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_ID] = $contribution->getId();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_RELATED_ID] = $contribution->getRelated()->getId();
        $opinionArray[ExportHeaders::EXPORT_CONTRIBUTION_VOTES_VALUE] = $this->translator->trans($voteValue);

        return $opinionArray;
    }

    private function getVoteCountPerOpinionVersion(OpinionVersion $opinionVersion, ConsultationStep $consultationStep, ?int $filterValue = null): int
    {
        $filterClosure = fn (OpinionVersionVote $vote) => null !== $vote->getStep()
            && $vote->getStep()->getId() === $consultationStep->getId()
            && $vote->getIsAccounted()
            && (null === $filterValue || $vote->getValue() === $filterValue);

        return $opinionVersion->getVotes()->filter($filterClosure)->count();
    }

    /**
     * @return Argument[]|Opinion[]|OpinionVersion[]|OpinionVersionVote[]|OpinionVote[]
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
            'a.opinion = :opinion AND a.published = true AND a.trashedAt IS NULL AND au.confirmationToken IS NULL',
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
            'ov.parent = :opinion AND ov.published = true AND ov.trashedAt IS NULL AND a.confirmationToken IS NULL',
            ['opinion' => $opinion],
            5000,
            $style,
            null,
            'ov.author',
            'a',
        );

        $contributions = [[$opinion], $opinionVotes, $opinionArguments];
        /** @var array<Argument|Opinion|OpinionVersion|OpinionVersionVote|OpinionVote> $allContributions */
        $allContributions = [$opinion, ...$opinionVotes, ...$opinionArguments];
        foreach ($opinionVersions as $opinionVersion) {
            /** @var OpinionVersionVote[] $opinionVersionVotes */
            $opinionVersionVotes = $this->batchProcessor->processQueryInBatches(
                OpinionVersionVote::class,
                'ovv',
                'ovv.opinionVersion = :opinionVersion AND ovv.published = true AND u.confirmationToken IS NULL',
                ['opinionVersion' => $opinionVersion],
                5000,
                $style,
                null,
                'ovv.user',
                'u',
            );

            $contributions[] = [$opinionVersion];
            $contributions[] = $opinionVersionVotes;
            $allContributions[] = $opinionVersion;
            foreach ($opinionVersionVotes as $opinionVersionVote) {
                $allContributions[] = $opinionVersionVote;
            }
        }

        foreach ($contributions as $contributionType => $contributionArray) {
            $countContributionsByType = \count($contributionArray);
            if (0 !== $countContributionsByType) {
                $style->writeln(sprintf('Batch processing complete, processed %d %s.', $countContributionsByType, $contributionType));
            }
        }

        return $allContributions;
    }

    /**
     * Excel auto-detects UTF-8 when BOM is present.
     *
     * @param resource $handle
     */
    private function writeUtf8Bom($handle): void
    {
        fwrite($handle, "\xEF\xBB\xBF");
    }
}
