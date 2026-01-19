<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Export\ProposalVoteExporter;
use Capco\AppBundle\Command\Serializer\BaseNormalizer;
use Capco\AppBundle\Command\Serializer\ParticipantNormalizer;
use Capco\AppBundle\Command\Serializer\ProposalCommentNormalizer;
use Capco\AppBundle\Command\Serializer\ProposalCommentVoteNormalizer;
use Capco\AppBundle\Command\Serializer\ProposalNewsCommentNormalizer;
use Capco\AppBundle\Command\Serializer\ProposalNewsCommentVoteNormalizer;
use Capco\AppBundle\Command\Serializer\ProposalNewsNormalizer;
use Capco\AppBundle\Command\Serializer\ProposalNormalizer;
use Capco\AppBundle\Command\Serializer\ReportingNormalizer;
use Capco\AppBundle\Command\Service\FilePathResolver\ContributionsFilePathResolver;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProposalStepInterface;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ExportHeaders;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\CommentVoteRepository;
use Capco\AppBundle\Repository\PostCommentRepository;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalCommentRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Repository\ReportingRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Helper\TableSeparator;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Stopwatch\Stopwatch;
use Symfony\Contracts\Translation\TranslatorInterface;

class ExportCollectAndSelectionContributionsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    private const BATCH_SIZE = 50;

    private const FULL_HEADER_KEYS = [
        ExportHeaders::EXPORT_CONTRIBUTION_TYPE,
        ExportHeaders::EXPORT_PROPOSAL_ID,
        ExportHeaders::EXPORT_PROPOSAL_PUBLISHED_AT,
        ExportHeaders::EXPORT_PROPOSAL_REFERENCE,
        ExportHeaders::EXPORT_PROPOSAL_TITLE,
        ExportHeaders::EXPORT_PROPOSAL_SUMMARY,
        ExportHeaders::EXPORT_PROPOSAL_DESCRIPTION,
        ExportHeaders::EXPORT_PROPOSAL_AUTHOR_ID,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_TOTAL_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_DIGITAL_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_TOTAL_PAPER_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_TOTAL_POINTS_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_DIGITAL_POINTS_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_PAPER_POINTS_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_CATEGORY_NAME,
        ExportHeaders::EXPORT_PROPOSAL_THEME_TITLE,
        ExportHeaders::EXPORT_PROPOSAL_FORMATTED_ADDRESS,
        ExportHeaders::EXPORT_PROPOSAL_ADDRESS_LAT,
        ExportHeaders::EXPORT_PROPOSAL_ADDRESS_LNG,
        ExportHeaders::EXPORT_PROPOSAL_DISTRICT_NAME,
        ExportHeaders::EXPORT_PROPOSAL_ESTIMATION,
        ExportHeaders::EXPORT_PROPOSAL_ILLUSTRATION,
        ExportHeaders::EXPORT_PROPOSAL_LINK,
        ExportHeaders::EXPORT_PROPOSAL_STATUS_NAME,
        ExportHeaders::EXPORT_PROPOSAL_CREATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_UPDATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_PUBLICATION_STATUS,
        ExportHeaders::EXPORT_PROPOSAL_UNDRAFT_AT,
        ExportHeaders::EXPORT_PROPOSAL_TRASHED_AT,
        ExportHeaders::EXPORT_PROPOSAL_TRASHED_REASON,
        ExportHeaders::EXPORT_PROPOSAL_AUTHOR_USERNAME,
        ExportHeaders::EXPORT_PROPOSAL_AUTHOR_IS_EMAIL_CONFIRMED,
        ExportHeaders::EXPORT_PROPOSAL_AUTHOR_EMAIL,
        ExportHeaders::EXPORT_PROPOSAL_AUTHOR_USER_TYPE_ID,
        ExportHeaders::EXPORT_PROPOSAL_AUTHOR_USER_TYPE_NAME,
        ExportHeaders::EXPORT_PROPOSAL_OFFICIAL_RESPONSE,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_ID,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_RANKING,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_CREATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_PUBLISHED_AT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_PUBLISHED,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_ACCOUNTED,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_ANONYMOUS,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_AUTHOR_ID,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_AUTHOR_USERNAME,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_AUTHOR_IS_EMAIL_CONFIRMED,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_AUTHOR_IS_PHONE_CONFIRMED,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_AUTHOR_USER_TYPE_ID,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_AUTHOR_USER_TYPE_NAME,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_ID,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_BODY,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_CREATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_PUBLISHED_AT,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_UPDATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_AUTHOR_ID,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_AUTHOR_USERNAME,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_AUTHOR_IS_EMAIL_CONFIRMED,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_AUTHOR_USER_TYPE_ID,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_AUTHOR_USER_TYPE_NAME,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_AUTHOR_EMAIL,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_PINNED,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_PUBLICATION_STATUS,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_VOTE_ID,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_VOTE_CREATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_VOTE_PUBLISHED_AT,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_ID,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_USERNAME,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_IS_EMAIL_CONFIRMED,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_USER_TYPE_ID,
        ExportHeaders::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_USER_TYPE_NAME,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_ID,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_TITLE,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_THEMES,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_LINKED_PROJECTS,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_LINKED_PROPOSAL,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_CREATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_UPDATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_PUBLISHED_AT,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_PUBLICATION_STATUS,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTABLE,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_DISPLAYED_ON_BLOG,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_AUTHORS_ID,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_AUTHORS_USERNAME,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_AUTHORS_IS_EMAIL_CONFIRMED,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_AUTHORS_USER_TYPE_ID,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_AUTHORS_USER_TYPE_NAME,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_ID,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_BODY,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_PARENT,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_CREATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_PUBLISHED_AT,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_UPDATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_ID,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_USERNAME,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_IS_EMAIL_CONFIRMED,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_USER_TYPE_ID,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_USER_TYPE_NAME,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_EMAIL,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_PINNED,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_PUBLICATION_STATUS,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_ID,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_CREATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_PUBLISHED_AT,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_ID,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_USERNAME,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_IS_EMAIL_CONFIRMED,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_USER_TYPE_ID,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_USER_TYPE_NAME,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_ID,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_CREATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_ID,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_USERNAME,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_IS_EMAIL_CONFIRMED,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_USER_TYPE_ID,
        ExportHeaders::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_USER_TYPE_NAME,
        ExportHeaders::EXPORT_PROPOSAL_REPORTINGS_ID,
        ExportHeaders::EXPORT_PROPOSAL_REPORTINGS_BODY,
        ExportHeaders::EXPORT_PROPOSAL_REPORTINGS_CREATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_ID,
        ExportHeaders::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_USERNAME,
        ExportHeaders::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_IS_EMAIL_CONFIRMED,
        ExportHeaders::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_USER_TYPE_ID,
        ExportHeaders::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_USER_TYPE_NAME,
    ];
    private const SIMPLIFIED_HEADER_KEYS = [
        ExportHeaders::EXPORT_CONTRIBUTION_TYPE,
        ExportHeaders::EXPORT_PROPOSAL_ID,
        ExportHeaders::EXPORT_PROPOSAL_PUBLISHED_AT,
        ExportHeaders::EXPORT_PROPOSAL_REFERENCE,
        ExportHeaders::EXPORT_PROPOSAL_TITLE,
        ExportHeaders::EXPORT_PROPOSAL_SUMMARY,
        ExportHeaders::EXPORT_PROPOSAL_DESCRIPTION,
        ExportHeaders::EXPORT_PROPOSAL_AUTHOR_ID,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_TOTAL_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_DIGITAL_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_TOTAL_PAPER_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_TOTAL_POINTS_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_DIGITAL_POINTS_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_PAPER_POINTS_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_CATEGORY_NAME,
        ExportHeaders::EXPORT_PROPOSAL_THEME_TITLE,
        ExportHeaders::EXPORT_PROPOSAL_FORMATTED_ADDRESS,
        ExportHeaders::EXPORT_PROPOSAL_ADDRESS_LAT,
        ExportHeaders::EXPORT_PROPOSAL_ADDRESS_LNG,
        ExportHeaders::EXPORT_PROPOSAL_DISTRICT_NAME,
        ExportHeaders::EXPORT_PROPOSAL_ESTIMATION,
        ExportHeaders::EXPORT_PROPOSAL_ILLUSTRATION,
        ExportHeaders::EXPORT_PROPOSAL_LINK,
        ExportHeaders::EXPORT_PROPOSAL_STATUS_NAME,
    ];
    private const GROUPED_HEADER_KEYS = [
        ExportHeaders::EXPORT_CONTRIBUTION_TYPE,
        ExportHeaders::EXPORT_PARTICIPANT_USER_ID,
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
        ExportHeaders::EXPORT_USER_TOTAL_VOTES,
        ExportHeaders::EXPORT_USER_TOTAL_PROPOSALS,
        ExportHeaders::EXPORT_USER_VOTES_PROPOSAL_IDS,
        ExportHEADERS::EXPORT_PROPOSAL_VOTES_ID,
        ExportHEADERS::EXPORT_PROPOSAL_VOTES_RANKING,
        ExportHEADERS::EXPORT_PROPOSAL_VOTES_CREATED_AT,
        ExportHeaders::EXPORT_PROPOSAL_REFERENCE,
        ExportHeaders::EXPORT_PROPOSAL_TITLE,
        ExportHeaders::EXPORT_PROPOSAL_LINK,
        ExportHeaders::EXPORT_PROPOSAL_ID,
        ExportHeaders::EXPORT_PROPOSAL_PUBLISHED_AT,
        ExportHeaders::EXPORT_PROPOSAL_SUMMARY,
        ExportHeaders::EXPORT_PROPOSAL_DESCRIPTION,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_TOTAL_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_DIGITAL_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_TOTAL_PAPER_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_TOTAL_POINTS_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_DIGITAL_POINTS_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_PAPER_POINTS_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_CATEGORY_NAME,
        ExportHeaders::EXPORT_PROPOSAL_THEME_TITLE,
        ExportHeaders::EXPORT_PROPOSAL_FORMATTED_ADDRESS,
        ExportHeaders::EXPORT_PROPOSAL_ADDRESS_LAT,
        ExportHeaders::EXPORT_PROPOSAL_ADDRESS_LNG,
        ExportHeaders::EXPORT_PROPOSAL_DISTRICT_NAME,
        ExportHeaders::EXPORT_PROPOSAL_ESTIMATION,
        ExportHeaders::EXPORT_PROPOSAL_ILLUSTRATION,
        ExportHeaders::EXPORT_PROPOSAL_STATUS_NAME,
    ];

    private const VOTE_DEPENDENT_HEADERS = [
        ExportHeaders::EXPORT_USER_TOTAL_VOTES,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_TOTAL_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_DIGITAL_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_TOTAL_PAPER_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_TOTAL_POINTS_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_DIGITAL_POINTS_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_PAPER_POINTS_COUNT,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_ID,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_RANKING,
        ExportHeaders::EXPORT_PROPOSAL_VOTES_CREATED_AT,
    ];

    protected static $defaultName = 'capco:export:collect-selection:contributions';

    private readonly string $projectRootDir;
    private string $delimiter = self::DEFAULT_CSV_DELIMITER;

    public function __construct(
        ExportUtils $exportUtils,
        private readonly Manager $toggleManager,
        string $projectRootDir,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ProposalVoteExporter $proposalVoteExporter,
        private readonly Stopwatch $stopwatch,
        private readonly EntityManagerInterface $em,
        private readonly TranslatorInterface $translator,
        private readonly SelectionStepRepository $selectionStepRepository,
        private readonly CollectStepRepository $collectStepRepository,
        private readonly ProposalNormalizer $proposalNormalizer,
        private readonly ProposalCommentRepository $proposalCommentRepository,
        private readonly ProposalCommentNormalizer $proposalCommentNormalizer,
        private readonly ProposalRepository $proposalRepository,
        private readonly CommentVoteRepository $commentVoteRepository,
        private readonly ProposalCommentVoteNormalizer $proposalCommentVoteNormalizer,
        private readonly ReportingRepository $reportingRepository,
        private readonly ReportingNormalizer $reportingNormalizer,
        private readonly PostRepository $postRepository,
        private readonly ProposalNewsNormalizer $proposalNewsNormalizer,
        private readonly PostCommentRepository $postCommentRepository,
        private readonly ProposalNewsCommentNormalizer $proposalNewsCommentNormalizer,
        private readonly ProposalNewsCommentVoteNormalizer $proposalNewsCommentVoteNormalizer,
        private readonly ProposalFormRepository $proposalFormRepository,
        private readonly ContributionsFilePathResolver $contributionsFilePathResolver,
        private readonly ParticipantNormalizer $participantNormalizer,
        private readonly AbstractStepRepository $abstractStepRepository,
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
                'Export Votes from Collect Step & Selection Step, contains only proposals from users validated accounts and published responses.'
            )
        ;
        $this->addOption(name: 'stepId', mode: InputOption::VALUE_REQUIRED, description: 'Only export the given step, it must implements ProposalStepInterface');
        $this->addOption(name: 'selectionSteps', mode: InputOption::VALUE_NONE, description: 'Export all selection steps');
        $this->addOption(name: 'collectSteps', mode: InputOption::VALUE_NONE, description: 'Export all collect steps');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $style = new SymfonyStyle($input, $output);
        $delimiterOption = $input->getOption('delimiter');
        $this->delimiter = \is_string($delimiterOption) && '' !== $delimiterOption
            ? $delimiterOption
            : self::DEFAULT_CSV_DELIMITER;

        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $style->error('Please enable "export" feature to run this command');

            return 1;
        }

        $this->stopwatch->start('export_votes', 'Memory usage - Execution time');

        $steps = $this->getSteps($input);
        $stepCount = \count($steps);

        $style->writeln(sprintf('Found %d step(s)', $stepCount));
        $style->note('Starting the export.');

        $tableSummary = (new Table($output))
            ->setHeaderTitle('Export collect/selection steps votes')
            ->setStyle('box-double')
            ->setHeaders(['Step', 'Proposal(s) votes exported'])
        ;

        $totalProposals = 0;

        /** @var ProposalStepInterface $step */
        foreach ($steps as $step) {
            $variants = $this->getVariantsConfig($step);

            $this->insertHeaders($variants);

            $proposals = $this->proposalRepository->getProposalsByProposalStep($step);

            $proposalTotalCount = $this->proposalRepository->countProposalsByProposalStep($step);

            $proposalCount = 0;

            $progressBar = $style->createProgressBar($proposalTotalCount);
            $progressBar->setFormat(
                "\n%current%/%max% processed proposal(s)  [%bar%] %percent%%" .
                "\n\nTotal Proposals Processed: %total_processed%" .
                "\nMemory Used: %memory_used%\n"
            );
            $progressBar->setMessage('processed proposal(s) ');
            $progressBar->setOverwrite(false);
            $style->newLine(2);

            // Pre-compute user statistics once per step for grouped export
            $userStats = match (true) {
                $step instanceof SelectionStep => $this->proposalSelectionVoteRepository->getUserStatsForStep($step),
                $step instanceof CollectStep => $this->proposalCollectVoteRepository->getUserStatsForStep($step),
                default => ['votes' => [], 'proposals' => []],
            };

            /** * @var Proposal $proposal */
            foreach ($proposals as $proposal) {
                // compute FULL proposal once
                $proposalFullData = $this->proposalNormalizer->normalize(
                    object: $proposal,
                    context: [
                        BaseNormalizer::EXPORT_VARIANT => ExportVariantsEnum::FULL,
                        'step' => $step,
                        'questionsResponses' => $this->proposalFormRepository->getQuestionsResponsesByProposalsIds([$proposal->getId()]),
                    ]
                );

                if (!\is_array($proposalFullData)) {
                    continue;
                }

                $author = $proposal->getAuthor();

                foreach ($variants as $variant => $config) {
                    $variant = ExportVariantsEnum::from($variant);
                    $handle = $config['handle'];
                    $headers = $config['headers'];

                    $proposalData = $this->getProposalByVariant(
                        variant: $variant,
                        proposalData: $proposalFullData,
                        contributor: $author,
                        userStats: $userStats,
                        step: $step
                    );
                    $this->fputcsv_assoc(handle: $handle, data: $proposalData, header: $headers);
                }

                $this->exportProposalComments(variants: $variants, proposal: $proposal, step: $step, proposalData: $proposalFullData);
                $this->exportProposalCommentsVotes(variants: $variants, proposal: $proposal, step: $step, proposalData: $proposalFullData);
                $this->exportProposalReportings(variants: $variants, proposal: $proposal, step: $step, proposalData: $proposalFullData);
                $this->exportProposalVotes(variants: $variants, proposal: $proposal, step: $step, proposalData: $proposalFullData, userStats: $userStats);
                $this->exportProposalNews(variants: $variants, proposal: $proposal, step: $step, proposalData: $proposalFullData);

                if (($proposalCount % self::BATCH_SIZE) === 0) {
                    $this->em->clear();
                }
                ++$proposalCount;

                $memoryUsage = $this->getFormattedMemoryUsage();
                $style->writeln(sprintf('Total Proposals Processed: %d (memory used: %s)', $proposalCount, $memoryUsage));

                $progressBar->setMessage($memoryUsage, 'memory_used');
                $progressBar->setMessage((string) $proposalCount, 'total_processed');
                $progressBar->advance();
                $style->newLine(2);
            }

            foreach ($variants as $variant => $config) {
                $this->executeSnapshot(
                    $input,
                    $output,
                    $step->getType() . '/' . $this->contributionsFilePathResolver->getFileName($step, ExportVariantsEnum::from($variant))
                );
            }

            foreach ($variants as $variant) {
                fclose($variant['handle']);
            }

            $totalProposals += $proposalCount;
            $tableSummary->addRows([[$step->getTitle(), $proposalCount], new TableSeparator()]);
        }

        $tableSummary->setFooterTitle('Total Proposals: ' . $totalProposals);
        $tableSummary->render();

        $eventInfo = $this->stopwatch->stop('export_votes')->__toString();
        $style->success(sprintf(
            "Command '%s' ended successfully. %s",
            self::$defaultName,
            $eventInfo
        ));

        return 0;
    }

    /**
     * @param array<string, mixed> $array
     * @param array<string>        $excludedKeys
     *
     * @return array<string, mixed>
     */
    protected function translateHeaders(array $array, array $excludedKeys = []): array
    {
        $translatedArray = [];
        foreach ($array as $key => $value) {
            if (\in_array($key, $excludedKeys, true)) {
                $translatedArray[$key] = $value;

                continue;
            }

            $translatedArray[$this->translator->trans($key)] = $value;
        }

        return $translatedArray;
    }

    /**
     * @param array<string, array{handle: resource, headers: array<string>, filename: string}> $variants
     * @param array<string, mixed>                                                             $proposalData
     */
    private function exportProposalNews(
        array $variants,
        Proposal $proposal,
        ProposalStepInterface $step,
        array $proposalData,
    ): void {
        foreach ($variants as $variant => $config) {
            $variant = ExportVariantsEnum::from($variant);
            $handle = $config['handle'];
            $headers = $config['headers'];

            if (ExportVariantsEnum::FULL !== $variant) {
                continue;
            }

            $posts = $this->postRepository->findByProposal($proposal);

            foreach ($posts as $post) {
                $postData = $this->proposalNewsNormalizer->normalize(
                    object: $post,
                    context: [
                        BaseNormalizer::EXPORT_VARIANT => ExportVariantsEnum::FULL,
                        'step' => $step,
                        'questionsResponses' => [],
                        'proposalId' => $proposal->getId(),
                    ]
                );

                $author = $proposal->getAuthor();
                if (!$author) {
                    continue;
                }

                $proposalData = $this->getProposalByVariant(
                    variant: $variant,
                    proposalData: $proposalData,
                    contributor: $author,
                    userStats: ['votes' => [], 'proposals' => []],
                    step: $step
                );

                $this->fputcsv_assoc(handle: $handle, data: [...$proposalData, ...$postData], header: $headers);

                $postComments = $this->postCommentRepository->findByPost($post);

                foreach ($postComments as $postComment) {
                    $postCommentData = $this->proposalNewsCommentNormalizer->normalize($postComment, null, [
                        BaseNormalizer::EXPORT_VARIANT => ExportVariantsEnum::FULL,
                        'step' => $step,
                        'questionsResponses' => [],
                        'proposalId' => $proposal->getId(),
                    ]);
                    $this->fputcsv_assoc($handle, [...$proposalData, ...$postCommentData], $headers);

                    $postReportings = $this->reportingRepository->findByComment($postComment);
                    foreach ($postReportings as $postReporting) {
                        $postReportingData = $this->reportingNormalizer->normalize($postReporting, null, [
                            BaseNormalizer::EXPORT_VARIANT => ExportVariantsEnum::FULL,
                            'step' => $step,
                            'questionsResponses' => [],
                        ]);
                        $this->fputcsv_assoc($handle, [...$proposalData, ...$postReportingData], $headers);
                    }

                    $postCommentVotes = $this->commentVoteRepository->findBy(['comment' => $postComment]);

                    foreach ($postCommentVotes as $postCommentVote) {
                        $postCommentVoteData = $this->proposalNewsCommentVoteNormalizer->normalize($postCommentVote, null, [
                            BaseNormalizer::EXPORT_VARIANT => ExportVariantsEnum::FULL,
                            'step' => $step,
                            'questionsResponses' => [],
                        ]);
                        $this->fputcsv_assoc($handle, [...$proposalData, ...$postCommentVoteData], $headers);
                    }
                }
            }
        }
    }

    /**
     * @param array<string, array{handle: resource, headers: array<string>}>  $variants
     * @param array<string, mixed>                                            $proposalData
     * @param array{votes: array<string, int>, proposals: array<string, int>} $userStats
     */
    private function exportProposalVotes(
        array $variants,
        Proposal $proposal,
        ProposalStepInterface $step,
        array $proposalData,
        array $userStats,
    ): void {
        $this->proposalVoteExporter->exportProposalVotes(
            variants: $variants,
            proposal: $proposal,
            step: $step,
            proposalData: $proposalData,
            userStats: $userStats,
            delimiter: $this->delimiter
        );
    }

    /**
     * @param array<string, array{handle: resource, headers: array<string>, filename: string}> $variants
     * @param array<string, mixed>                                                             $proposalData
     */
    private function exportProposalReportings(
        array $variants,
        Proposal $proposal,
        ProposalStepInterface $step,
        array $proposalData,
    ): void {
        foreach ($variants as $variant => $config) {
            $variant = ExportVariantsEnum::from($variant);
            $handle = $config['handle'];
            $headers = $config['headers'];

            if (ExportVariantsEnum::FULL !== $variant) {
                continue;
            }

            $reportings = $this->reportingRepository->findByProposal($proposal);
            foreach ($reportings as $reporting) {
                $reportingData = $this->reportingNormalizer->normalize(
                    object: $reporting,
                    context: [
                        BaseNormalizer::EXPORT_VARIANT => ExportVariantsEnum::FULL,
                        'step' => $step,
                        'questionsResponses' => [],
                    ]
                );

                $author = $proposal->getAuthor();
                if (!$author) {
                    continue;
                }

                $proposalData = $this->getProposalByVariant(
                    variant: $variant,
                    proposalData: $proposalData,
                    contributor: $author,
                    userStats: ['votes' => [], 'proposals' => []],
                    step: $step
                );

                $this->fputcsv_assoc(handle: $handle, data: [...$proposalData, ...$reportingData], header: $headers);
            }
        }
    }

    /**
     * @param array<string, array{handle: resource, headers: array<string>, filename: string}> $variants
     * @param array<string, mixed>                                                             $proposalData
     */
    private function exportProposalCommentsVotes(
        array $variants,
        Proposal $proposal,
        ProposalStepInterface $step,
        array $proposalData,
    ): void {
        foreach ($variants as $variant => $config) {
            $variant = ExportVariantsEnum::from($variant);
            $handle = $config['handle'];
            $headers = $config['headers'];

            if (ExportVariantsEnum::FULL !== $variant) {
                continue;
            }

            $commentsVotes = $this->commentVoteRepository->findByProposal($proposal);
            foreach ($commentsVotes as $commentVote) {
                $commentVoteData = $this->proposalCommentVoteNormalizer->normalize(
                    object: $commentVote,
                    context: [
                        BaseNormalizer::EXPORT_VARIANT => ExportVariantsEnum::FULL,
                        'step' => $step,
                        'questionsResponses' => [],
                    ]
                );

                $author = $proposal->getAuthor();
                if (!$author) {
                    continue;
                }

                $proposalData = $this->getProposalByVariant(
                    variant: $variant,
                    proposalData: $proposalData,
                    contributor: $author,
                    userStats: ['votes' => [], 'proposals' => []],
                    step: $step
                );

                $this->fputcsv_assoc(handle: $handle, data: [...$proposalData, ...$commentVoteData], header: $headers);
            }
        }
    }

    /**
     * @param array<string, array{handle: resource, headers: array<string>, filename: string}> $variants
     * @param array<string, mixed>                                                             $proposalData
     */
    private function exportProposalComments(
        array $variants,
        Proposal $proposal,
        ProposalStepInterface $step,
        array $proposalData,
    ): void {
        foreach ($variants as $variant => $config) {
            $variant = ExportVariantsEnum::from($variant);
            $handle = $config['handle'];
            $headers = $config['headers'];

            if (ExportVariantsEnum::FULL !== $variant) {
                continue;
            }
            $comments = $this->proposalCommentRepository->findByProposal($proposal);
            foreach ($comments as $comment) {
                $commentData = $this->proposalCommentNormalizer->normalize(
                    object: $comment,
                    context: [
                        BaseNormalizer::EXPORT_VARIANT => ExportVariantsEnum::FULL,
                        'step' => $step,
                        'questionsResponses' => [],
                    ]
                );

                $author = $proposal->getAuthor();
                if (!$author) {
                    continue;
                }

                $proposalData = $this->getProposalByVariant(
                    variant: $variant,
                    proposalData: $proposalData,
                    contributor: $author,
                    userStats: ['votes' => [], 'proposals' => []],
                    step: $step
                );

                $this->fputcsv_assoc(handle: $handle, data: [...$proposalData, ...$commentData], header: $headers);
            }
        }
    }

    /**
     * @param resource     $handle
     * @param array<mixed> $data
     * @param array<mixed> $header
     */
    private function fputcsv_assoc($handle, array $data, array $header): bool|int
    {
        $row = [];
        foreach ($header as $col) {
            $row[] = $data[$col] ?? null;
        }

        return fputcsv($handle, $row, $this->delimiter);
    }

    /**
     * @return array<int, object>
     */
    private function getSteps(InputInterface $input): array
    {
        if ($input->getOption('stepId')) {
            /** * @var ProposalStepInterface|null $step  */
            $step = $this->abstractStepRepository->find($input->getOption('stepId'));
            if (!$step instanceof ProposalStepInterface) {
                throw new \InvalidArgumentException(sprintf('Step "%s" should implements ProposalStepInterface.', $input->getOption('stepId')));
            }

            return [$step];
        }

        $selectionSteps = [];
        $collectSteps = [];
        if ($input->getOption('selectionSteps')) {
            $selectionSteps = $this->selectionStepRepository->findAll();
        }

        if ($input->getOption('collectSteps')) {
            $collectSteps = $this->collectStepRepository->findAll();
        }

        return [...$selectionSteps, ...$collectSteps];
    }

    /**
     * @param array<mixed> $original
     * @param array<mixed> $toInsert
     *
     * @return array<mixed>
     */
    private function array_merge_after_key(array $original, array $toInsert, string $key): array
    {
        $pos = array_search($key, $original);

        if (false === $pos) {
            return array_merge($original, $toInsert);
        }

        $before = \array_slice($original, 0, $pos + 1, true);
        $after = \array_slice($original, $pos + 1, null, true);

        return [...$before, ...$toInsert, ...$after];
    }

    /**
     * @return array<string>
     */
    private function getHeaders(ProposalStepInterface $step, ExportVariantsEnum $variant): array
    {
        $questionsKeys = array_map(
            fn ($question) => $question->getTitle(),
            $step->getProposalForm()?->getRealQuestions()?->toArray() ?? []
        );

        $baseKeys = match ($variant) {
            ExportVariantsEnum::FULL => self::FULL_HEADER_KEYS,
            ExportVariantsEnum::SIMPLIFIED => self::SIMPLIFIED_HEADER_KEYS,
            ExportVariantsEnum::GROUPED => self::GROUPED_HEADER_KEYS,
        };

        if (!$step->isVotable()) {
            $baseKeys = array_values(array_diff($baseKeys, self::VOTE_DEPENDENT_HEADERS));
        }

        $headers = $this->array_merge_after_key(
            $baseKeys,
            $questionsKeys,
            ExportHeaders::EXPORT_PROPOSAL_DISTRICT_NAME
        );

        return array_map(fn ($header) => $this->translator->trans($header), $headers);
    }

    /**
     * @param array<string, mixed>                                            $proposalData
     * @param array{votes: array<string, int>, proposals: array<string, int>} $userStats
     *
     * @return array<string, mixed>
     */
    private function getProposalByVariant(
        ExportVariantsEnum $variant,
        array $proposalData,
        Author|ContributorInterface $contributor,
        array $userStats,
        ProposalStepInterface $step
    ): array {
        return match ($variant) {
            ExportVariantsEnum::FULL, ExportVariantsEnum::SIMPLIFIED => $proposalData,
            ExportVariantsEnum::GROUPED => (
                function () use ($contributor, $variant, $step, $userStats, $proposalData) {
                    $userData = $this->participantNormalizer->normalize(object: $contributor, context: [
                        BaseNormalizer::EXPORT_VARIANT => $variant,
                    ]);

                    $authorId = $contributor->getId();

                    if ($step->isVotable()) {
                        $userData[$this->translator->trans(ExportHeaders::EXPORT_USER_TOTAL_VOTES)] = $userStats['votes'][$authorId] ?? 0;
                    }

                    $userData[$this->translator->trans(ExportHeaders::EXPORT_USER_TOTAL_PROPOSALS)] = $userStats['proposals'][$authorId] ?? 0;

                    return [...$userData, ...$proposalData];
                }
            )(),
        };
    }

    private function getFormattedMemoryUsage(): string
    {
        return round(memory_get_usage() / 1048576, 2) . ' MB';
    }

    /**
     * @param array<string, array{handle: resource, headers: array<string>, filename: string}> $variants
     */
    private function insertHeaders(array $variants): void
    {
        foreach ($variants as $config) {
            $handle = $config['handle'];
            $headers = $config['headers'];
            $this->writeUtf8Bom($handle);
            fputcsv($handle, $headers, $this->delimiter);
        }
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

    /**
     * @return array<string, array{handle: resource, headers: array<string>, filename: string}>
     */
    private function getVariantsConfig(ProposalStepInterface $step): array
    {
        $fullExportFilename = $this->contributionsFilePathResolver->getFullExportPath($step);
        $simplifiedExportFilename = $this->contributionsFilePathResolver->getSimplifiedExportPath($step);
        $groupedExportPathFilename = $this->contributionsFilePathResolver->getGroupedExportPath($step);

        $this->ensureExportDirectory($fullExportFilename);
        $this->ensureExportDirectory($simplifiedExportFilename);
        $this->ensureExportDirectory($groupedExportPathFilename);

        $fullExportHandle = fopen($fullExportFilename, 'w');
        if (false === $fullExportHandle) {
            throw new \RuntimeException("Cannot open file: {$fullExportFilename}");
        }
        $simplifiedExportHandle = fopen($simplifiedExportFilename, 'w');
        if (false === $simplifiedExportHandle) {
            throw new \RuntimeException("Cannot open file: {$simplifiedExportFilename}");
        }
        $groupedExportHandle = fopen($groupedExportPathFilename, 'w');
        if (false === $groupedExportHandle) {
            throw new \RuntimeException("Cannot open file: {$groupedExportPathFilename}");
        }

        return [
            ExportVariantsEnum::FULL->value => [
                'handle' => $fullExportHandle,
                'headers' => $this->getHeaders($step, ExportVariantsEnum::FULL),
                'filename' => $fullExportFilename,
            ],
            ExportVariantsEnum::SIMPLIFIED->value => [
                'handle' => $simplifiedExportHandle,
                'headers' => $this->getHeaders($step, ExportVariantsEnum::SIMPLIFIED),
                'filename' => $simplifiedExportFilename,
            ],
            ExportVariantsEnum::GROUPED->value => [
                'handle' => $groupedExportHandle,
                'headers' => $this->getHeaders($step, ExportVariantsEnum::GROUPED),
                'filename' => $groupedExportPathFilename,
            ],
        ];
    }

    private function ensureExportDirectory(string $filePath): void
    {
        $directory = \dirname($filePath);
        if (!is_dir($directory) && !@mkdir($directory, 0755, true) && !is_dir($directory)) {
            throw new \RuntimeException("Cannot create export directory: {$directory}");
        }
    }
}
