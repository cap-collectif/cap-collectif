<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\OpinionAppendixNormalizer;
use Capco\AppBundle\Command\Serializer\OpinionArgumentNormalizer;
use Capco\AppBundle\Command\Serializer\OpinionNormalizer;
use Capco\AppBundle\Command\Serializer\OpinionReportingNormalizer;
use Capco\AppBundle\Command\Serializer\OpinionSourceNormalizer;
use Capco\AppBundle\Command\Serializer\OpinionVersionNormalizer;
use Capco\AppBundle\Command\Serializer\OpinionVersionVoteNormalizer;
use Capco\AppBundle\Command\Serializer\OpinionVoteNormalizer;
use Capco\AppBundle\Command\Service\ExportInterface\ExportableContributionInterface;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\SerializerInterface;

class ConsultationContributionExporter extends ContributionExporter
{
    public function __construct(
        protected EntityManagerInterface $entityManager,
        private readonly ConsultationStepRepository $consultationStepRepository,
        private readonly OpinionNormalizer $opinionNormalizer,
        private readonly OpinionArgumentNormalizer $opinionArgumentNormalizer,
        private readonly OpinionAppendixNormalizer $opinionAppendixNormalizer,
        private readonly OpinionVersionNormalizer $opinionVersionNormalizer,
        private readonly OpinionVoteNormalizer $opinionVoteNormalizer,
        private readonly OpinionVersionVoteNormalizer $opinionVersionVoteNormalizer,
        private readonly OpinionSourceNormalizer $opinionSourceNormalizer,
        private readonly OpinionReportingNormalizer $opinionReportingNormalizer,
        private readonly ContributionsFilePathResolver $contributionsFilePathResolver,
        private readonly LoggerInterface $logger,
        Filesystem $fileSystem,
        private readonly BatchProcessor $batchProcessor
    ) {
        $this->serializer = $this->initializeSerializer();

        parent::__construct($this->entityManager, $this->serializer, $fileSystem, $this->contributionsFilePathResolver);
    }

    /**
     * @param Opinion[] $opinions
     */
    public function exportConsultationContributions(
        array $opinions,
        ?string $delimiter,
        ConsultationStep $consultationStep,
        bool $append
    ): void {
        $paths['simplified'] = $this->contributionsFilePathResolver->getSimplifiedExportPath($consultationStep);
        $paths['full'] = $this->contributionsFilePathResolver->getFullExportPath($consultationStep);

        if ($this->shouldExport($consultationStep->getId(), $paths, $append)) {
            $this->setDelimiter($delimiter);
            $this->exportContributionsInBatches($opinions, $consultationStep, $append);
        }
    }

    private function getOldestUpdateDate(string $simplifiedPath, string $fullPath): \DateTime
    {
        $simplifiedFileDate = filemtime($simplifiedPath);
        $fullFileDate = filemtime($fullPath);

        return (new \DateTime())->setTimestamp(min($simplifiedFileDate, $fullFileDate));
    }

    /**
     * @param array<string, string> $paths
     */
    private function shouldExport(string $consultationStepId, array $paths, bool $append): bool
    {
        if ($append || !file_exists($paths['simplified']) || !file_exists($paths['full'])) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($paths['simplified'], $paths['full']);

        try {
            return $this->consultationStepRepository->hasRecentContributionsOrUpdatedUsers($consultationStepId, $oldestUpdateDate);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());

            return false;
        }
    }

    /**
     * @param Opinion[] $opinions
     */
    private function exportContributionsInBatches(
        array $opinions,
        ConsultationStep $consultationStep,
        bool $append
    ): void {
        $withHeader = true;
        if ($append) {
            $withHeader = false;
        }

        $progressBar = $this->style->createProgressBar(\count($opinions));
        $progressBar->setFormat(
            "\n%current%/%max% processed proposal(s)  [%bar%] %percent%%" .
            "\n\nTotal Contributions Processed: %total_processed% contributions" .
            "\nMemory Used: %memory_used%\n"
        );
        $progressBar->setMessage('processed proposal(s) ');
        $progressBar->setOverwrite(false);
        $this->style->newLine(2);

        $totalEntities = 0;
        foreach ($opinions as $opinion) {
            $contributions = $this->getAllContributionsFromOpinionByBatch($opinion, $totalEntities);
            $memUse = round(memory_get_usage() / 1000000, 2) . 'MB';
            $this->style->writeln(sprintf('Total Contributions Processed for current Opinion: %d (memory used: %s)', \count($contributions), $memUse));
            $this->exportContributions($contributions, $consultationStep, $withHeader, $append);

            $withHeader = false;
            $progressBar->setMessage($memUse, 'memory_used');
            $progressBar->setMessage((string) $totalEntities, 'total_processed');
            $progressBar->advance();
            $this->style->newLine(2);
        }
        $this->entityManager->clear();
        $progressBar->finish();
    }

    private function initializeSerializer(): SerializerInterface
    {
        return new Serializer(
            [
                $this->opinionNormalizer,
                $this->opinionArgumentNormalizer,
                $this->opinionAppendixNormalizer,
                $this->opinionVoteNormalizer,
                $this->opinionVersionNormalizer,
                $this->opinionVersionVoteNormalizer,
                $this->opinionReportingNormalizer,
                $this->opinionSourceNormalizer,
            ],
            [new CsvEncoder()],
        );
    }

    /**
     * @return array<ExportableContributionInterface>
     */
    private function getAllContributionsFromOpinionByBatch(Opinion $opinion, int &$totalEntities): array
    {
        $opinionAppendices = $this->batchProcessor->processQueryInBatches(
            OpinionAppendix::class,
            'oa',
            'oa.opinion = :opinion',
            ['opinion' => $opinion],
            5000,
            $this->style
        );

        $opinionVotes = $this->batchProcessor->processQueryInBatches(
            OpinionVote::class,
            'ov',
            'ov.opinion = :opinion AND ov.published = true AND u.confirmationToken IS NULL',
            ['opinion' => $opinion],
            5000,
            $this->style,
            null,
            'ov.user',
            'u',
        );

        $opinionArguments = $this->batchProcessor->processQueryInBatches(
            Argument::class,
            'a',
            'a.opinion = :opinion AND a.published = true AND au.confirmationToken IS NULL',
            ['opinion' => $opinion],
            5000,
            $this->style,
            null,
            'a.author',
            'au',
        );

        $opinionArgumentReports = [];
        foreach ($opinionArguments as $argument) {
            $opinionArgumentReports = $this->batchProcessor->processQueryInBatches(
                Reporting::class,
                'r',
                'r.Argument = :argument AND u.confirmationToken IS NULL',
                ['argument' => $argument],
                5000,
                $this->style,
                null,
                'r.Reporter',
                'u',
            );
        }

        $opinionVersions = $this->batchProcessor->processQueryInBatches(
            OpinionVersion::class,
            'ov',
            'ov.parent = :opinion AND ov.published = true AND a.confirmationToken IS NULL',
            ['opinion' => $opinion],
            5000,
            $this->style,
            null,
            'ov.author',
            'a',
        );

        $opinionVersionVotes = [];
        $opinionVersionReports = [];
        foreach ($opinionVersions as $opinionVersion) {
            $opinionVersionVotes = $this->batchProcessor->processQueryInBatches(
                OpinionVersionVote::class,
                'ovv',
                'ovv.opinionVersion = :opinionVersion AND ovv.published = true AND u.confirmationToken IS NULL',
                ['opinionVersion' => $opinionVersion],
                5000,
                $this->style,
                null,
                'ovv.user',
                'u',
            );

            $opinionVersionReports = $this->batchProcessor->processQueryInBatches(
                Reporting::class,
                'r',
                'r.opinionVersion = :opinionVersion AND u.confirmationToken IS NULL',
                ['opinionVersion' => $opinionVersion],
                5000,
                $this->style,
                null,
                'r.Reporter',
                'u',
            );
        }

        $opinionSources = $this->batchProcessor->processQueryInBatches(
            Source::class,
            's',
            's.opinion = :opinion AND s.published = true AND a.confirmationToken IS NULL',
            ['opinion' => $opinion],
            5000,
            $this->style,
            null,
            's.author',
            'a',
        );

        $opinionSourceReports = [];
        foreach ($opinionSources as $source) {
            $opinionSourceReports = $this->batchProcessor->processQueryInBatches(
                Reporting::class,
                'r',
                'r.Source = :source AND u.confirmationToken IS NULL',
                ['source' => $source],
                5000,
                $this->style,
                null,
                'r.Reporter',
                'u',
            );
        }

        $opinionReports = $this->batchProcessor->processQueryInBatches(
            Reporting::class,
            'r',
            'r.Opinion = :opinion AND u.confirmationToken IS NULL',
            ['opinion' => $opinion],
            5000,
            $this->style,
            null,
            'r.Reporter',
            'u',
        );

        $contributions = [
            'Opinion' => [$opinion],
            'OpinionAppendix' => $opinionAppendices,
            'OpinionReports' => $opinionReports,
            'OpinionVote' => $opinionVotes,
            'OpinionArguments' => $opinionArguments,
            'OpinionArgumentsReports' => $opinionArgumentReports,
            'OpinionVersion' => $opinionVersions,
            'OpinionVersionReports' => $opinionVersionReports,
            'OpinionVersionVote' => $opinionVersionVotes,
            'OpinionSource' => $opinionSources,
            'OpinionSourceReports' => $opinionSourceReports,
        ];

        foreach ($contributions as $contributionType => $contributionArray) {
            $countContributionsByType = \count($contributionArray);
            $totalEntities += $countContributionsByType;
            if (0 !== $countContributionsByType) {
                $this->style->writeln(sprintf('Batch processing complete, processed %d %s.', $countContributionsByType, $contributionType));
            }
        }

        return array_merge(
            [$opinion],
            $opinionAppendices,
            $opinionReports,
            $opinionVotes,
            $opinionArguments,
            $opinionArgumentReports,
            $opinionVersions,
            $opinionVersionReports,
            $opinionVersionVotes,
            $opinionSources,
            $opinionSourceReports,
        );
    }
}
