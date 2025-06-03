<?php

declare(strict_types=1);

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Serializer\ProposalCommentNormalizer;
use Capco\AppBundle\Command\Serializer\ProposalCommentVoteNormalizer;
use Capco\AppBundle\Command\Serializer\ProposalNewsComment;
use Capco\AppBundle\Command\Serializer\ProposalNewsCommentReporting;
use Capco\AppBundle\Command\Serializer\ProposalNewsCommentVote;
use Capco\AppBundle\Command\Serializer\ProposalNewsNormalizer;
use Capco\AppBundle\Command\Serializer\ProposalNormalizer;
use Capco\AppBundle\Command\Serializer\ProposalVoteNormalizer;
use Capco\AppBundle\Command\Serializer\ReportingNormalizer;
use Capco\AppBundle\Command\Service\ExportInterface\ExportableContributionInterface;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectSmsVote;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalSelectionSmsVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Repository\ProposalRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;

class CollectAndSelectionContributionExporter extends ContributionExporter
{
    protected EntityManagerInterface $entityManager;
    /**
     * @var null|array<int|string, array<int, mixed>>
     */
    private ?array $questionsResponses = null;
    private ?Proposal $proposal = null;

    public function __construct(
        private readonly ProposalNormalizer $proposalNormalizer,
        private readonly ProposalNewsNormalizer $proposalNewsNormalizer,
        private readonly ProposalNewsComment $proposalNewsCommentNormalizer,
        private readonly ProposalNewsCommentReporting $proposalNewsCommentReportingNormalizer,
        private readonly ProposalNewsCommentVote $proposalNewsCommentVoteNormalizer,
        private readonly ProposalCommentNormalizer $proposalCommentNormalizer,
        private readonly ProposalCommentVoteNormalizer $proposalCommentVoteNormalizer,
        private readonly ProposalVoteNormalizer $voteNormalizer,
        private readonly ReportingNormalizer $reportingNormalizer,
        EntityManagerInterface $entityManager,
        private readonly LoggerInterface $logger,
        Filesystem $fileSystem,
        private readonly ContributionsFilePathResolver $contributionsFilePathResolver,
        private readonly ProposalRepository $proposalRepository,
        private readonly BatchProcessor $batchProcessor
    ) {
        $this->serializer = $this->initializeSerializer();

        parent::__construct($entityManager, $this->serializer, $fileSystem, $contributionsFilePathResolver);
    }

    /**
     * @param Proposal[]            $proposals
     * @param array<string, string> $filePaths
     */
    public function exportStepContributions(
        AbstractStep $step,
        array $proposals,
        ?string $delimiter,
        bool $append,
        array $filePaths
    ): void {
        $this->setDelimiter($delimiter);

        if ($this->shouldExport($step, $proposals, $filePaths, $append)) {
            $this->exportContributionsInBatches($proposals, $step, $append);
        }
    }

    /**
     * @param array<int|string, array<int, mixed>> $questionsResponses
     */
    public function setQuestionsResponses(array $questionsResponses): self
    {
        $this->questionsResponses = $questionsResponses;

        return $this;
    }

    protected function getOldestUpdateDate(string $simplifiedPath, string $fullPath): \DateTimeImmutable
    {
        $fullFileDate = filemtime($fullPath);
        if (file_exists($simplifiedPath)) {
            $simplifiedFileDate = filemtime($simplifiedPath);

            return (new \DateTimeImmutable())->setTimestamp(min($simplifiedFileDate, $fullFileDate));
        }

        return (new \DateTimeImmutable())->setTimestamp($fullFileDate);
    }

    /**
     * @param array<ExportableContributionInterface> $contributions
     */
    protected function write(AbstractStep $step, array $contributions, bool $withHeader, bool $isFullExport, bool $append): void
    {
        $context = [
            CsvEncoder::DELIMITER_KEY => $this->delimiter,
            CsvEncoder::OUTPUT_UTF8_BOM_KEY => $withHeader,
            CsvEncoder::NO_HEADERS_KEY => !$withHeader,
            BaseNormalizer::IS_FULL_EXPORT => $isFullExport,
            BaseNormalizer::IS_EXPORT_NORMALIZER => true,
            'step' => $step,
            'questionsResponses' => $this->questionsResponses,
            'proposal' => $this->proposal,
        ];

        if (!$context[BaseNormalizer::IS_FULL_EXPORT]) {
            $contributions = array_filter($contributions, static function (ExportableContributionInterface $contribution) {
                switch ($contribution::class) {
                    case Proposal::class:
                        $author = $contribution->getAuthor();
                        $authorConfirmed = null !== $author && $author->isEmailConfirmed();

                        return !$contribution->isDraft()
                            && !$contribution->isTrashed()
                            && $contribution->isPublished()
                            && $authorConfirmed;

                    case ProposalComment::class:
                        $proposal = $contribution->getProposal();
                        $author = null !== $proposal ? $proposal->getAuthor() : null;
                        $authorConfirmed = null !== $author && $author->isEmailConfirmed();

                        return !$proposal->isTrashed()
                            && $proposal->isPublished()
                            && $authorConfirmed;

                    default:
                        return true;
                }
            });

            $contributions = array_values($contributions);
        }

        if ([] === $contributions) {
            return;
        }

        $content = $this->serializer->serialize(
            $contributions,
            CsvEncoder::FORMAT,
            $context
        );

        $path = $isFullExport
            ? $this->contributionsFilePathResolver->getFullExportPath($step)
            : $this->contributionsFilePathResolver->getSimplifiedExportPath($step);

        $path .= '.tmp';

        if ($withHeader && !$append) {
            $this->fileSystem->dumpFile($path, $content);
        } else {
            $this->fileSystem->appendToFile($path, $content);
        }

        unset($content);
    }

    /**
     * @param Proposal[]            $proposals
     * @param array<string, string> $filePaths
     */
    private function shouldExport(AbstractStep $step, array $proposals, array $filePaths, bool $append): bool
    {
        if ($append || !file_exists($filePaths['full'])) {
            return true;
        }

        $oldestUpdateDate = $this->getOldestUpdateDate($filePaths['simplified'], $filePaths['full']);

        try {
            return $this->proposalRepository->hasNewContributionsForCollectOrSelectionStep($step, $proposals, $oldestUpdateDate);
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());

            return false;
        }
    }

    /**
     * @param Proposal[] $proposals
     */
    private function exportContributionsInBatches(
        array $proposals,
        AbstractStep $step,
        bool $append
    ): void {
        $withHeader = true;
        if ($append) {
            $withHeader = false;
        }

        $progressBar = $this->style->createProgressBar(\count($proposals));
        $progressBar->setFormat(
            "\n%current%/%max% processed proposal(s)  [%bar%] %percent%%" .
            "\n\nTotal Contributions Processed: %total_processed% contributions" .
            "\nMemory Used: %memory_used%\n"
        );
        $progressBar->setMessage('processed proposal(s) ');
        $progressBar->setOverwrite(false);
        $this->style->newLine(2);

        $totalEntities = 0;
        foreach ($proposals as $proposal) {
            $this->proposal = $proposal;
            $contributions = $this->getAllContributionsFromProposalByBatch($proposal, $step, $totalEntities);
            $memUse = round(memory_get_usage() / 1000000, 2) . 'MB';
            $this->style->writeln(sprintf('Total Contributions Processed for current Proposal: %d (memory used: %s)', \count($contributions), $memUse));
            $this->exportContributions($contributions, $step, $withHeader, $append);

            $withHeader = false;
            $progressBar->setMessage($memUse, 'memory_used');
            $progressBar->setMessage((string) $totalEntities, 'total_processed');
            $progressBar->advance();
            $this->style->newLine(2);
        }
        $this->entityManager->clear();
        $progressBar->finish();
    }

    /**
     * @return array<ExportableContributionInterface>
     */
    private function getAllContributionsFromProposalByBatch(Proposal $proposal, AbstractStep $step, int &$totalEntities): array
    {
        $proposalComments = $this->batchProcessor->processQueryInBatches(
            ProposalComment::class,
            'c',
            'c.proposal = :proposal',
            ['proposal' => $proposal],
            5000,
            $this->style
        );

        $proposalCommentsVotes = [];
        foreach ($proposalComments as $proposalComment) {
            $proposalCommentsVotes = $this->batchProcessor->processQueryInBatches(
                CommentVote::class,
                'cv',
                'cv.comment = :comment AND cv.isAccounted = 1 AND cv.published = 1',
                ['comment' => $proposalComment],
                5000,
                $this->style
            );
        }

        $proposalReports = $this->batchProcessor->processQueryInBatches(
            Reporting::class,
            'r',
            'r.proposal = :proposal',
            ['proposal' => $proposal],
            5000,
            $this->style
        );

        $proposalNews = $this->batchProcessor->processQueryInBatches(
            Post::class,
            'p',
            ':proposal MEMBER OF p.proposals',
            ['proposal' => $proposal],
            5000,
            $this->style,
            function (?Post $news) use ($proposal) {
                if (null !== $news) {
                    $news->proposalId = $proposal->getId();
                }
            }
        );

        $proposalNewsComments = [];
        $proposalNewsCommentsReporting = [];
        $proposalNewsCommentsVotes = [];
        foreach ($proposalNews as $post) {
            $proposalNewsComments = $this->batchProcessor->processQueryInBatches(
                PostComment::class,
                'pc',
                'pc.post = :post',
                ['post' => $post],
                5000,
                $this->style
            );

            if ([] === $proposalNewsComments) {
                continue;
            }

            foreach ($proposalNewsComments as $comment) {
                $proposalNewsCommentsReportingBatch = $this->batchProcessor->processQueryInBatches(
                    Reporting::class,
                    'r',
                    'r.Comment = :comment',
                    ['comment' => $comment],
                    5000,
                    $this->style
                );

                foreach ($proposalNewsCommentsReportingBatch as $report) {
                    $proposalNewsCommentsReporting[] = $report;
                }

                $proposalNewsCommentsVotesBatch = $this->batchProcessor->processQueryInBatches(
                    CommentVote::class,
                    'cv',
                    'cv.comment = :comment',
                    ['comment' => $comment],
                    5000,
                    $this->style
                );

                foreach ($proposalNewsCommentsVotesBatch as $vote) {
                    $proposalNewsCommentsVotes[] = $vote;
                }
            }
        }

        $proposalDigitalVotes = [];
        $proposalAnonymousVotes = [];
        $isVotable = $step->isVotable();
        if ($isVotable) {
            switch ($step->getType()) {
                case 'selection':
                    $proposalDigitalVotes = $this->batchProcessor->processQueryInBatches(
                        ProposalSelectionVote::class,
                        'v',
                        'v.proposal = :proposal',
                        ['proposal' => $proposal],
                        5000,
                        $this->style
                    );

                    $proposalAnonymousVotes = $this->batchProcessor->processQueryInBatches(
                        ProposalSelectionSmsVote::class,
                        'v',
                        'v.proposal = :proposal',
                        ['proposal' => $proposal],
                        5000,
                        $this->style
                    );

                    break;

                case 'collect':
                    $proposalDigitalVotes = $this->batchProcessor->processQueryInBatches(
                        ProposalCollectVote::class,
                        'v',
                        'v.proposal = :proposal',
                        ['proposal' => $proposal],
                        5000,
                        $this->style
                    );

                    $proposalAnonymousVotes = $this->batchProcessor->processQueryInBatches(
                        ProposalCollectSmsVote::class,
                        'v',
                        'v.proposal = :proposal',
                        ['proposal' => $proposal],
                        5000,
                        $this->style
                    );

                    break;

                default:
                    return [];
            }
        }
        $contributions = [
            'Proposal' => [$proposal],
            'ProposalComment' => $proposalComments,
            'CommentVote (ProposalComment)' => $proposalCommentsVotes,
            'Reporting (Proposal)' => $proposalReports,
            'DigitalVote' => $proposalDigitalVotes,
            'AnonymousVote' => $proposalAnonymousVotes,
            'Post' => $proposalNews,
            'PostComment' => $proposalNewsComments,
            'CommentVote (PostComment)' => $proposalNewsCommentsVotes,
            'Reporting (PostComment)' => $proposalNewsCommentsReporting,
        ];

        foreach ($contributions as $contributionType => $contributionArray) {
            $countContributionsByType = \count($contributionArray);
            $totalEntities += $countContributionsByType;
            if (0 !== $countContributionsByType) {
                $this->style->writeln(sprintf('Batch processing complete, processed %d %s.', $countContributionsByType, $contributionType));
            }
        }

        return array_merge(
            [$proposal],
            $proposalNews,
            $proposalNewsComments,
            $proposalNewsCommentsReporting,
            $proposalNewsCommentsVotes,
            $proposalComments,
            $proposalCommentsVotes,
            $proposalReports,
            $proposalDigitalVotes,
            $proposalAnonymousVotes
        );
    }

    private function initializeSerializer(): Serializer
    {
        return new Serializer(
            [
                $this->proposalNormalizer,
                $this->proposalNewsNormalizer,
                $this->proposalNewsCommentNormalizer,
                $this->proposalNewsCommentReportingNormalizer,
                $this->proposalNewsCommentVoteNormalizer,
                $this->voteNormalizer,
                $this->proposalCommentNormalizer,
                $this->proposalCommentVoteNormalizer,
                $this->reportingNormalizer,
            ],
            [new CsvEncoder()]
        );
    }
}
