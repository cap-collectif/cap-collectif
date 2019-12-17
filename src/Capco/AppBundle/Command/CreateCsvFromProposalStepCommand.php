<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Utils\Arr;
use Capco\AppBundle\Utils\Text;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\GraphQL\InfoResolver;
use Overblog\GraphQLBundle\Request\Executor;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\AppBundle\Repository\ProjectRepository;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\Repository\CollectStepRepository;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Repository\SelectionStepRepository;

class CreateCsvFromProposalStepCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    protected const PROPOSALS_PER_PAGE = 10;
    protected const VOTES_PER_PAGE = 150;
    protected const COMMENTS_PER_PAGE = 150;
    protected const NEWS_PER_PAGE = 70;
    protected const REPORTINGS_PER_PAGE = 100;

    protected const COMMENT_INFOS_FRAGMENT = <<<'EOF'
fragment commentInfos on Comment {
  id
  body
  parent {
    id
  }
  createdAt
  publishedAt
  updatedAt
  author {
    ... authorInfos
    email
  }
  pinned
  publicationStatus
  votes {
    edges {
      node {
         ... commentVoteInfos
      }
    }
  }
  reportings {
    pageInfo {
      startCursor
      endCursor
      hasNextPage
    }
    edges {
      cursor
      node {
        ... reportingInfos
      }
    }
  }
  kind
  answers {
      id
      body
      parent {
        id
      }
      createdAt
      publishedAt
      updatedAt
      author {
        ... authorInfos
        email
      }
      pinned
      publicationStatus
      reportings {
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            ... reportingInfos
          }
        }
      }
      kind
  }
}
EOF;
    protected const NEWS_INFO_FRAGMENT = <<<'EOF'
fragment newsInfo on Post {
  id
  title
  authors {
    ... authorInfos
  }
  relatedContent {
    __typename
    ... on Proposal {
      title
    }
    ... on Theme {
      title
    }
    ... on Project {
      title
    }
  }
  comments {
    edges {
      node {
        ... commentInfos
      }
    }
  }
  createdAt
  updatedAt
  commentable
  displayedOnBlog
  publishedAt
  abstract
  publicationStatus
}
EOF;
    protected const PROPOSAL_VOTE_INFOS_FRAGMENT = <<<'EOF'
fragment voteInfos on ProposalVote{
  id
  createdAt
  publishedAt
  anonymous
  ranking
  published
  author {
    ... authorInfos
  }
}
EOF;
    protected const COMMENT_VOTE_INFOS_FRAGMENT = <<<'EOF'
fragment voteInfos on CommentVote{
  id
  createdAt
  publishedAt
  author {
    ... authorInfos
  }
}
EOF;
    protected const USER_TYPE_INFOS_FRAGMENT = <<<'EOF'
fragment userTypeInfos on UserType {
  id
  name
}
EOF;
    protected const AUTHOR_INFOS_FRAGMENT = <<<'EOF'
fragment authorInfos on User {
  id
  username
  isEmailConfirmed
  email
  userType {
    ...userTypeInfos
  }
}
EOF;
    protected const REPORTING_INFOS_FRAGMENT = <<<'EOF'
fragment reportingInfos on Reporting {
  id
  author {
    ... authorInfos
  }
  type
  bodyText
  createdAt
}
EOF;
    protected const COMMENT_VOTE_INFOS = <<<'EOF'
fragment commentVoteInfos on CommentVote {
  id
  createdAt
  publishedAt
  kind
  author {
    ... authorInfos
  }
}
EOF;
    protected const PROPOSAL_HEADER = [
        'proposal_id' => 'id',
        'proposal_reference' => 'reference',
        'proposal_title' => 'title',
        'proposal_votes_totalCount' => 'allVotes.totalCount',
        'proposal_createdAt' => 'createdAt',
        'proposal_publishedAt' => 'publishedAt',
        'proposal_updatedAt' => 'updatedAt',
        'proposal_publicationStatus' => 'publicationStatus',
        'proposal_trashedAt' => 'trashedAt',
        'proposal_trashedReason' => 'trashedReason',
        'proposal_link' => 'url',
        'proposal_author_id' => 'author.id',
        'proposal_author_username' => 'author.username',
        'proposal_author_isEmailConfirmed' => 'author.isEmailConfirmed',
        'proposal_author_email' => 'author.email',
        'proposal_author_userType_id' => 'author.userType.id',
        'proposal_author_userType_name' => 'author.userType.name',
        'proposal_status_name' => 'status.name',
        'proposal_estimation' => 'estimation',
        'proposal_category_name' => 'category.name',
        'proposal_theme_title' => 'theme.title',
        'proposal_formattedAddress' => 'address.formatted',
        'proposal_district_name' => 'district.name',
        'proposal_illustration' => 'media.url',
        'proposal_summary' => 'summary',
        'proposal_description' => 'bodyText'
    ];

    protected const COLUMN_MAPPING_EXCEPT_PROPOSAL_HEADER = [
        //votes
        'proposal_votes_id' => 'vote.id',
        'proposal_votes_ranking' => 'vote.ranking',
        'proposal_votes_createdAt' => 'vote.createdAt',
        'proposal_votes_publishedAt' => 'vote.publishedAt',
        'proposal_votes_published' => 'vote.published',
        'proposal_votes_anonymous' => 'vote.anonymous',
        'proposal_votes_author_id' => 'vote.author.id',
        'proposal_votes_author_username' => 'vote.author.username',
        'proposal_votes_author_isEmailConfirmed' => 'vote.author.isEmailConfirmed',
        'proposal_votes_author_userType_id' => 'vote.author.userType.id',
        'proposal_votes_author_userType_name' => 'vote.author.userType.name',
        //comments
        'proposal_comments_id' => 'comment.id',
        'proposal_comments_body' => 'comment.body',
        'proposal_comments_createdAt' => 'comment.createdAt',
        'proposal_comments_publishedAt' => 'comment.publishedAt',
        'proposal_comments_updatedAt' => 'comment.updatedAt',
        'proposal_comments_author_id' => 'comment.author.id',
        'proposal_comments_author_username' => 'comment.author.username',
        'proposal_comments_author_isEmailConfirmed' => 'comment.author.isEmailConfirmed',
        'proposal_comments_author_userType_id' => 'comment.author.userType.id',
        'proposal_comments_author_userType_name' => 'comment.author.userType.name',
        'proposal_comments_author_email' => 'comment.author.email',
        'proposal_comments_pinned' => 'comment.pinned',
        'proposal_comments_publicationStatus' => 'comment.publicationStatus',
        //comment vote
        'proposal_comments_vote_id' => 'comment_vote.id',
        'proposal_comments_vote_createdAt' => 'comment_vote.createdAt',
        'proposal_comments_vote_publishedAt' => 'comment_vote.publishedAt',
        'proposal_comments_vote_author_id' => 'comment_vote.author.id',
        'proposal_comments_vote_author_username' => 'comment_vote.author.username',
        'proposal_comments_vote_author_isEmailConfirmed' => 'comment_vote.author.isEmailConfirmed',
        'proposal_comments_vote_author_userType_id' => 'comment_vote.author.userType.id',
        'proposal_comments_vote_author_userType_name' => 'comment_vote.author.userType.name',
        //news
        'proposal_news_id' => 'new.id',
        'proposal_news_title' => 'new.title',
        'proposal_news_themes' => 'new.relatedContent',
        'proposal_news_linkedProjects' => 'new.relatedContent',
        'proposal_news_linkedProposal' => 'new.relatedContent',
        'proposal_news_createdAt' => 'new.createdAt',
        'proposal_news_updatedAt' => 'new.updatedAt',
        'proposal_news_publishedAt' => 'new.publishedAt',
        'proposal_news_publicationStatus' => 'new.publicationStatus',
        'proposal_news_commentable' => 'new.commentable',
        'proposal_news_displayedOnBlog' => 'new.displayedOnBlog',
        'proposal_news_authors_id' => 'new.authors.id',
        'proposal_news_authors_username' => 'new.authors.username',
        'proposal_news_authors_isEmailConfirmed' => 'new.authors.isEmailConfirmed',
        'proposal_news_authors_userType_id' => 'new.authors.userType.id',
        'proposal_news_authors_userType_name' => 'new.authors.userType.name',
        //news comment
        'proposal_news_comments_id' => 'news_comment.id',
        'proposal_news_comments_body' => 'news_comment.body',
        'proposal_news_comments_parent' => 'news_comment.parent',
        'proposal_news_comments_createdAt' => 'news_comment.createdAt',
        'proposal_news_comments_publishedAt' => 'news_comment.publishedAt',
        'proposal_news_comments_updatedAt' => 'news_comment.updatedAt',
        'proposal_news_comments_author_id' => 'news_comment.author.id',
        'proposal_news_comments_author_username' => 'news_comment.author.username',
        'proposal_news_comments_author_isEmailConfirmed' => 'news_comment.author.isEmailConfirmed',
        'proposal_news_comments_author_userType_id' => 'news_comment.author.userType.id',
        'proposal_news_comments_author_userType_name' => 'news_comment.author.userType.name',
        'proposal_news_comments_author_email' => 'news_comment.author.email',
        'proposal_news_comments_pinned' => 'news_comment.pinned',
        'proposal_news_comments_publicationStatus' => 'news_comment.publicationStatus',
        //news comment vote
        'proposal_news_comments_vote_id' => 'news_comment_vote.id',
        'proposal_news_comments_vote_createdAt' => 'news_comment_vote.createdAt',
        'proposal_news_comments_vote_publishedAt' => 'news_comment_vote.publishedAt',
        'proposal_news_comments_vote_author_id' => 'news_comment_vote.author.id',
        'proposal_news_comments_vote_author_username' => 'news_comment_vote.author.username',
        'proposal_news_comments_vote_author_isEmailConfirmed' =>
            'news_comment_vote.author.isEmailConfirmed',
        'proposal_news_comments_vote_author_userType_id' => 'news_comment_vote.author.userType.id',
        'proposal_news_comments_vote_author_userType_name' =>
            'news_comment_vote.author.userType.name',
        //news comments reportings
        'proposal_news_comments_reportings_id' => 'news_comment_reporting.id',
        'proposal_news_comments_reportings_createdAt' => 'news_comment_reporting.createdAt',
        'proposal_news_comments_reportings_author_id' => 'news_comment_reporting.author.id',
        'proposal_news_comments_reportings_author_username' =>
            'news_comment_reporting.author.username',
        'proposal_news_comments_reportings_author_isEmailConfirmed' =>
            'news_comment_reporting.author.isEmailConfirmed',
        'proposal_news_comments_reportings_author_userType_id' =>
            'news_comment_reporting.author.userType.id',
        'proposal_news_comments_reportings_author_userType_name' =>
            'news_comment_reporting.author.userType.name',
        //reporting
        'proposal_reportings_id' => 'reporting.id',
        'proposal_reportings_body' => 'reporting.bodyText',
        'proposal_reportings_createdAt' => 'reporting.createdAt',
        'proposal_reportings_author_id' => 'reporting.author.id',
        'proposal_reportings_author_username' => 'reporting.author.username',
        'proposal_reportings_author_isEmailConfirmed' => 'reporting.author.isEmailConfirmed',
        'proposal_reportings_author_userType_id' => 'reporting.author.userType.id',
        'proposal_reportings_author_userType_name' => 'reporting.author.userType.name'
    ];

    protected $projectRepository;
    protected $toggleManager;
    protected $executor;
    protected $writer;
    protected $infoResolver;
    protected $currentQuery;
    protected $currentData;
    /** @var CollectStep $currentStep */
    protected $currentStep;
    protected $voteCursor;
    protected $proposalCursor;
    protected $commentCursor;
    protected $headersMap = [];

    protected $proposalHeaderMap = [];

    protected $currentProposalIndex;
    protected $logger;

    protected static $defaultName = 'capco:export:proposalStep';
    private $selectionStepRepository;
    private $projectRootDir;
    private $collectStepRepository;
    private $connectionTraversor;

    public function __construct(
        Executor $executor,
        ExportUtils $exportUtils,
        ProjectRepository $projectRepository,
        GraphQlAclListener $listener,
        SelectionStepRepository $selectionStepRepository,
        CollectStepRepository $collectStepRepository,
        Manager $toggleManager,
        LoggerInterface $logger,
        ConnectionTraversor $connectionTraversor,
        string $projectRootDir
    ) {
        $listener->disableAcl();
        $this->executor = $executor;
        $this->toggleManager = $toggleManager;
        $this->projectRepository = $projectRepository;
        $this->infoResolver = new InfoResolver();
        $this->logger = $logger;
        $this->selectionStepRepository = $selectionStepRepository;
        $this->projectRootDir = $projectRootDir;
        $this->collectStepRepository = $collectStepRepository;
        $this->connectionTraversor = $connectionTraversor;
        parent::__construct($exportUtils);
    }

    public function sanitizeResponses(array &$proposal): void
    {
        if (isset($proposal['responses'])) {
            $responses = $proposal['responses'];
            foreach ($responses as $index => $response) {
                if ('section' === $response['question']['kind']) {
                    unset($responses[$index]);
                }
            }
            $responses = array_values($responses);
            $proposal['responses'] = $responses;
        }
    }

    public function isSubdataBlocColumn(string $haystack, string $needle): bool
    {
        $i = 0;
        if (\strlen($needle) > \strlen($haystack)) {
            return false;
        }
        while ($i < \strlen($needle)) {
            if ($needle[$i] !== $haystack[$i]) {
                return false;
            }
            ++$i;
        }

        return true;
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setDescription('Create csv file from step which have proposals')->addArgument(
            'projectId',
            InputArgument::OPTIONAL,
            'The ID of the project'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->toggleManager->isActive('export')) {
            $output->writeln('Please enable "export" feature to run this command');

            return;
        }

        if ($project = $this->getProject($input)) {
            $steps = $project
                ->getSteps()
                ->filter(function (ProjectAbstractStep $projectAbstractStep) {
                    return $projectAbstractStep->getStep() instanceof SelectionStep ||
                        $projectAbstractStep->getStep() instanceof CollectStep;
                })
                ->map(function (ProjectAbstractStep $projectAbstractStep) {
                    return $projectAbstractStep->getStep();
                });
        } else {
            $steps = array_merge(
                $this->collectStepRepository->findAll(),
                $this->selectionStepRepository->findAll()
            );
        }

        /** @var AbstractStep $step */
        foreach ($steps as $step) {
            if ($step->getProject()) {
                $fileName = $this->getFilename($step);
                $this->currentStep = $step;
                $this->generateSheet($this->currentStep, $input, $output);
                $this->executeSnapshot($input, $output, $fileName);

                $this->printMemoryUsage($output);
            }
        }
    }

    protected function generateSheet(AbstractStep $step, InputInterface $input, OutputInterface $output): void
    {
        $fileName = $this->getFilename($step);
        if (!isset($this->currentData['data']) && isset($this->currentData['error'])) {
            $this->logger->error('GraphQL Query Error: ' . $this->currentData['error']);
            $this->logger->info('GraphQL query: ' . json_encode($this->currentData));
        }

        $proposalsQuery = $this->getContributionsGraphQLQueryByProposalStep($this->currentStep);
        $proposals = $this->executor
            ->execute('internal', [
                'query' => $proposalsQuery,
                'variables' => []
            ])
            ->toArray();
        $totalCount = Arr::path($proposals, 'data.node.proposals.totalCount');

        $delimiter = $input->getOption('delimiter');
        $this->writer = WriterFactory::create(Type::CSV, $delimiter);
        $this->writer->openToFile(sprintf('%s/public/export/%s', $this->projectRootDir, $fileName));

        if ($totalCount > 0) {
            $output->writeln('<info>Importing ' . $totalCount . ' proposals...</info>');

            $this->headersMap = $this->createHeadersMap($proposals);
            $this->writer->addRow(
                array_merge(['contribution_type'], array_keys($this->headersMap))
            );
            $progress = new ProgressBar($output, $totalCount);
            $this->connectionTraversor->traverse(
                $proposals,
                'proposals',
                function ($edge) use ($progress, $output) {
                    $proposal = $edge['node'] && \is_array($edge['node']) ? $edge['node'] : [];
                    $this->addProposalRow($proposal, $output);
                    $progress->advance();
                },
                function ($pageInfo) {
                    return $this->getContributionsGraphQLQueryByProposalStep(
                        $this->currentStep,
                        $pageInfo['endCursor']
                    );
                }
            );

            $progress->clear();
        } else {
            // Add the header in CSV.
            $this->writer->addRow(
                array_merge(
                    ['contribution_type'],
                    array_merge(
                        array_keys(self::PROPOSAL_HEADER),
                        array_keys(self::COLUMN_MAPPING_EXCEPT_PROPOSAL_HEADER)
                    )
                )
            );

            $output->writeln(
                "<info>No proposal found for step '" .
                    $step->getTitle() .
                    "' in project '" .
                    $step->getProject()->getTitle() .
                    "'</info>"
            );
        }

        $this->writer->close();

        $output->writeln('The export file "' . $fileName . '" has been created.');
    }

    protected function extractRowFromResponse(string $columnName, array $questions): ?string
    {
        foreach ($questions as $question) {
            if (isset($question['question']) && $question['question']['title'] === $columnName) {
                if (isset($question['formattedValue'])) {
                    return Text::cleanNewline($question['formattedValue']);
                }
                if (isset($question['medias'])) {
                    $urls = array_map(function ($media) {
                        return $media['url'];
                    }, $question['medias']);

                    return implode(', ', $urls);
                }

                return '';
            }
        }

        return null;
    }

    protected function handleProposalValues(
        array $proposal,
        string $columnName,
        string $path,
        array &$row
    ): void {
        $arr = explode('.', $path);
        if ('responses' === $arr[0]) {
            $val = isset($proposal['responses'])
                ? $this->extractRowFromResponse($columnName, $proposal['responses'])
                : '';
            $row[] = $val;
        } elseif ('evaluation' === $arr[0] && 'responses' === $arr[1]) {
            $val = isset($proposal['evaluation']['responses'])
                ? $this->extractRowFromResponse($columnName, $proposal['evaluation']['responses'])
                : '';
            $row[] = $val;
        } elseif ('reference' === $arr[0]) {
            $row[] = '"' . $proposal['reference'] . '"';
        } else {
            $val = $proposal;
            foreach ($arr as $a) {
                if (isset($val[$a])) {
                    $val = $val[$a];
                } else {
                    $val = '';

                    break;
                }
            }
            if (\is_bool($val)) {
                $val = $val ? 'Yes' : 'No';
            }
            $row[] = $val;
        }
    }

    protected function reportingQuery(array $proposal, OutputInterface $output): void
    {
        $reportingsQuery = $this->getProposalReportingsGraphQLQuery($proposal['id']);
        $proposalWithReportings = $this->executor
            ->execute('internal', [
                'query' => $reportingsQuery,
                'variables' => []
            ])
            ->toArray();

        $totalCount = Arr::path($proposalWithReportings, 'data.node.reportings.totalCount');
        $progress = new ProgressBar($output, $totalCount);
        $output->writeln(
            "<info>Importing ${totalCount} reportings for proposal " .
                $proposal['title'] .
                '</info>'
        );

        $this->connectionTraversor->traverse(
            $proposalWithReportings,
            'reportings',
            function ($edge) use ($proposal, $progress) {
                $report = $edge['node'] && \is_array($edge['node']) ? $edge['node'] : [];
                $this->addProposalReportRow($report, $proposal);
                $progress->advance();
            },
            function ($pageInfo) use ($proposal) {
                return $this->getProposalReportingsGraphQLQuery(
                    $proposal['id'],
                    $pageInfo['endCursor']
                );
            }
        );

        $progress->clear();
    }

    protected function voteQuery(array $proposal, OutputInterface $output): void
    {
        $votesQuery = $this->getProposalVotesGraphQLQuery(
            $proposal['id'],
            $this->currentStep->getId()
        );
        $proposalsWithVotes = $this->executor
            ->execute('internal', [
                'query' => $votesQuery,
                'variables' => []
            ])
            ->toArray();

        $totalCount = Arr::path($proposalsWithVotes, 'data.node.votes.totalCount');
        $progress = new ProgressBar($output, $totalCount);

        $output->writeln(
            "<info>Importing ${totalCount} votes for proposal " . $proposal['title'] . '</info>'
        );

        $this->connectionTraversor->traverse(
            $proposalsWithVotes,
            'votes',
            function ($edge) use ($proposal, $progress) {
                $vote = $edge['node'] && \is_array($edge['node']) ? $edge['node'] : [];
                $this->addProposalVotesRow($vote, $proposal);
                $progress->advance();
            },
            function ($pageInfo) use ($proposal) {
                return $this->getProposalVotesGraphQLQuery(
                    $proposal['id'],
                    $this->currentStep->getId(),
                    $pageInfo['endCursor']
                );
            }
        );
        $progress->clear();
    }

    protected function commentQuery(array $proposal, OutputInterface $output): void
    {
        $commentsQuery = $this->getProposalCommentsGraphQLQuery($proposal['id']);
        $proposalsWithComments = $this->executor
            ->execute('internal', [
                'query' => $commentsQuery,
                'variables' => []
            ])
            ->toArray();

        $totalCount = Arr::path($proposalsWithComments, 'data.node.comments.totalCount');

        $progress = new ProgressBar($output, $totalCount);

        $output->writeln(
            "<info>Importing ${totalCount} comments for proposal " . $proposal['title'] . '</info>'
        );
        $this->connectionTraversor->traverse(
            $proposalsWithComments,
            'comments',
            function ($edge) use ($proposal, $progress) {
                $comment = $edge['node'] && \is_array($edge['node']) ? $edge['node'] : [];
                $this->addProposalCommentRow($comment, $proposal);
                if (isset($comment['answers']) && !empty($comment['answers'])) {
                    foreach ($comment['answers'] as $answer) {
                        $this->addProposalCommentRow($answer, $proposal);
                    }
                }
                $progress->advance();
            },
            function ($pageInfo) use ($proposal) {
                return $this->getProposalCommentsGraphQLQuery(
                    $proposal['id'],
                    $pageInfo['endCursor']
                );
            }
        );
        $progress->clear();
    }

    protected function newsQuery(array $proposal, OutputInterface $output): void
    {
        $newsQuery = $this->getProposalNewsGraphQLQuery($proposal['id']);
        $proposalWithNews = $this->executor
            ->execute('internal', [
                'query' => $newsQuery,
                'variables' => []
            ])
            ->toArray();

        $totalCount = Arr::path($proposalWithNews, 'data.node.news.totalCount');
        $progress = new ProgressBar($output, $totalCount);

        $output->writeln(
            "<info>Importing ${totalCount} news for proposal " . $proposal['title'] . '</info>'
        );

        $this->connectionTraversor->traverse(
            $proposalWithNews,
            'news',
            function ($edge) use ($proposal, $progress) {
                if ($edge) {
                    $news = $edge['node'] && \is_array($edge['node']) ? $edge['node'] : [];
                    $this->addProposalNewsRow($news, $proposal, $edge['cursor']);
                }
                $progress->advance();
            },
            function ($pageInfo) use ($proposal) {
                return $this->getProposalNewsGraphQLQuery($proposal['id'], $pageInfo['endCursor']);
            }
        );

        $progress->clear();
    }

    protected function addProposalRow(array $proposal, OutputInterface $output): void
    {
        $this->sanitizeResponses($proposal);

        $row = ['proposal'];
        foreach ($this->headersMap as $columnName => $path) {
            $this->handleProposalValues($proposal, $columnName, $path, $row);
        }
        $this->writer->addRow($row);

        $this->reportingQuery($proposal, $output);

        $this->voteQuery($proposal, $output);

        $this->commentQuery($proposal, $output);

        $this->newsQuery($proposal, $output);
    }

    protected function addProposalReportRow(array $report, array $proposal): void
    {
        $this->addDataBlock('proposalReporting', 'reporting', $report, $proposal);
    }

    protected function addDataBlock(
        string $type,
        string $submodulePath,
        array $entity,
        array $proposal
    ): void {
        $row = [$type];
        foreach ($this->headersMap as $columnName => $path) {
            if (isset($this->proposalHeaderMap[$columnName])) {
                $this->handleProposalValues($proposal, $columnName, $path, $row);

                continue;
            }
            if (!$this->isSubdataBlocColumn($path, "${submodulePath}.")) {
                $row[] = '';

                continue;
            }
            $arr = explode('.', substr($path, \strlen("${submodulePath}.")));
            $val = $entity;
            foreach ($arr as $a) {
                if (isset($val[$a])) {
                    $val = $val[$a];
                } else {
                    $val = '';

                    break;
                }
            }
            if (\is_bool($val)) {
                $val = $val ? 'Yes' : 'No';
            }
            $row[] = $val;
        }
        $this->writer->addRow($row);
    }

    protected function addProposalVotesRow(array $vote, array $proposal): void
    {
        $this->addDataBlock('proposalVote', 'vote', $vote, $proposal);
    }

    protected function addProposalNewsRow(
        array $news,
        array $proposal,
        string $proposalNewsCursor
    ): void {
        $row = ['proposalNews'];
        foreach ($this->headersMap as $columnName => $path) {
            if (isset($this->proposalHeaderMap[$columnName])) {
                $this->handleProposalValues($proposal, $columnName, $path, $row);

                continue;
            }
            if ($this->isSubdataBlocColumn($path, 'new.')) {
                $path = substr($path, \strlen('new.'));
                $this->handleProposalNewsValues($news, $columnName, $path, $row);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);

        $this->connectionTraversor->traverse(
            $news,
            'comments',
            function ($edge) use ($proposal, $news, $proposalNewsCursor) {
                $comment = $edge['node'] && \is_array($edge['node']) ? $edge['node'] : [];
                $this->addProposalNewsCommentRow(
                    $comment,
                    $proposal,
                    $news,
                    $proposalNewsCursor,
                    $edge['cursor']
                );
            },
            function ($pageInfo) use ($proposal, $proposalNewsCursor) {
                return $this->getProposalNewsGraphQLQuery(
                    $proposal['id'],
                    $proposalNewsCursor,
                    $pageInfo['endCursor']
                );
            }
        );
    }

    protected function addProposalNewsCommentRow(
        array $comment,
        array $proposal,
        array $news,
        string $proposalNewsCursor,
        string $proposalNewsCommentCursor
    ): void {
        $row = ['proposalNewsComment'];
        foreach ($this->headersMap as $columnName => $path) {
            if ($this->isSubdataBlocColumn($path, 'news_comment.')) {
                $path = substr($path, \strlen('news_comment.'));
                $value = Arr::path($comment, $path);
                $row[] = $this->exportUtils->parseCellValue($value);
            } elseif (isset($this->proposalHeaderMap[$path])) {
                $this->handleProposalValues($proposal, $columnName, $path, $row);
            } elseif ($this->isSubdataBlocColumn($path, 'new.')) {
                $path = substr($path, \strlen('new.'));
                $this->handleProposalNewsValues($news, $columnName, $path, $row);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);

        $this->connectionTraversor->traverse(
            $comment,
            'votes',
            function ($edge) use ($proposal, $news, $comment) {
                $vote = $edge['node'] && \is_array($edge['node']) ? $edge['node'] : [];
                $this->addProposalNewsCommentVoteRow($vote, $comment, $proposal, $news);
            },
            function ($pageInfo) use ($proposal, $proposalNewsCursor, $proposalNewsCommentCursor) {
                return $this->getProposalNewsGraphQLQuery(
                    $proposal['id'],
                    $proposalNewsCursor,
                    $proposalNewsCommentCursor,
                    $pageInfo['endCursor']
                );
            }
        );

        $this->connectionTraversor->traverse(
            $comment,
            'reportings',
            function ($edge) use ($proposal, $news, $comment) {
                $report = $edge['node'] && \is_array($edge['node']) ? $edge['node'] : [];
                $this->addProposalNewsCommentReportingRow($report, $comment, $proposal, $news);
            },
            function ($pageInfo) use ($proposal, $proposalNewsCursor, $proposalNewsCommentCursor) {
                return $this->getProposalNewsGraphQLQuery(
                    $proposal['id'],
                    $proposalNewsCursor,
                    $proposalNewsCommentCursor,
                    null,
                    $pageInfo['endCursor']
                );
            }
        );
    }

    protected function addProposalNewsCommentVoteRow(
        array $vote,
        array $comment,
        array $proposal,
        array $news
    ): void {
        $row = ['proposalNewsCommentVote'];
        foreach ($this->headersMap as $path => $columnName) {
            if ($this->isSubdataBlocColumn($path, 'news_comment_vote.')) {
                $path = substr($path, \strlen('news_comment_vote.'));
                $value = Arr::path($vote, $path);
                $row[] = $this->exportUtils->parseCellValue($value);
            } elseif ($this->isSubdataBlocColumn($path, 'news_comment.')) {
                $path = substr($path, \strlen('news_comment.'));
                $value = Arr::path($comment, $path);
                $row[] = $this->exportUtils->parseCellValue($value);
            } elseif (isset($this->proposalHeaderMap[$path])) {
                $this->handleProposalValues($proposal, $columnName, $path, $row);
            } elseif ($this->isSubdataBlocColumn($path, 'new.')) {
                $path = substr($path, \strlen('new.'));
                $this->handleProposalNewsValues($news, $columnName, $path, $row);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);
    }

    protected function addProposalNewsCommentReportingRow(
        array $report,
        array $comment,
        array $proposal,
        array $news
    ): void {
        $row = ['proposalNewsCommentReporting'];

        foreach ($this->headersMap as $path => $columnName) {
            if ($this->isSubdataBlocColumn($path, 'news_comment_reporting.')) {
                $path = substr($path, \strlen('news_comment_reporting.'));
                $value = Arr::path($report, $path);
                $row[] = $this->exportUtils->parseCellValue($value);
            } elseif ($this->isSubdataBlocColumn($path, 'news_comment_vote.')) {
                $path = substr($path, \strlen('news_comment_vote.'));
                $value = Arr::path($comment, $path);
                $row[] = $this->exportUtils->parseCellValue($value);
            } elseif ($this->isSubdataBlocColumn($path, 'news_comment.')) {
                $path = substr($path, \strlen('news_comment.'));
                $value = Arr::path($comment, $path);
                $row[] = $this->exportUtils->parseCellValue($value);
            } elseif ($this->isSubdataBlocColumn($path, 'new.')) {
                $path = substr($path, \strlen('new.'));
                $this->handleProposalNewsValues($news, $columnName, $path, $row);
            } elseif (isset($this->proposalHeaderMap[$path])) {
                $this->handleProposalValues($proposal, $columnName, $path, $row);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);
    }

    protected function addProposalCommentRow(array $comment, array $proposal): void
    {
        $this->addDataBlock($comment['kind'], 'comment', $comment, $proposal);

        $commentReportings = $this->getProposalCommentReportingsGraphQLQuery($comment['id']);
        $commentWithReportings = $this->executor
            ->execute('internal', [
                'query' => $commentReportings,
                'variables' => []
            ])
            ->toArray();

        $this->connectionTraversor->traverse(
            $commentWithReportings,
            'reportings',
            function ($edge) use ($proposal, $comment) {
                $report = $edge['node'] && \is_array($edge['node']) ? $edge['node'] : [];
                $this->addProposalCommentReportRow($report, $proposal, $comment);
            },
            function ($pageInfo) use ($comment) {
                return $this->getProposalCommentReportingsGraphQLQuery(
                    $comment['id'],
                    $pageInfo['endCursor']
                );
            }
        );

        $commentVotesQuery = $this->getProposalCommentVotesGraphQLQuery($comment['id']);
        $commentWithVotes = $this->executor
            ->execute('internal', [
                'query' => $commentVotesQuery,
                'variables' => []
            ])
            ->toArray();

        $this->connectionTraversor->traverse(
            $commentWithVotes,
            'votes',
            function ($edge) use ($proposal, $comment) {
                $vote = $edge['node'] && \is_array($edge['node']) ? $edge['node'] : [];
                $this->addProposalCommentVotesRow($vote, $proposal, $comment);
            },
            function ($pageInfo) use ($comment) {
                return $this->getProposalCommentVotesGraphQLQuery(
                    $comment['id'],
                    $pageInfo['endCursor']
                );
            }
        );
    }

    protected function addProposalCommentReportRow(
        array $report,
        array $proposal,
        array $comment
    ): void {
        $row = ['proposalCommentReporting'];

        foreach ($this->headersMap as $path => $columnName) {
            if ($this->isSubdataBlocColumn($path, 'reporting.')) {
                $path = substr($path, \strlen('news_comment_reporting.'));
                $value = Arr::path($report, $path);
                $row[] = $this->exportUtils->parseCellValue($value);
            } elseif ($this->isSubdataBlocColumn($path, 'news_comment.')) {
                $path = substr($path, \strlen('news_comment.'));
                $value = Arr::path($comment, $path);
                $row[] = $this->exportUtils->parseCellValue($value);
            } elseif (isset($this->proposalHeaderMap[$path])) {
                $this->handleProposalValues($proposal, $columnName, $path, $row);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);
    }

    protected function addProposalCommentVotesRow(
        array $vote,
        array $proposal,
        array $comment
    ): void {
        $row = ['proposalCommentVote'];
        foreach ($this->headersMap as $path => $columnName) {
            if ($this->isSubdataBlocColumn($path, 'comment_vote.')) {
                $path = substr($path, \strlen('comment_vote.'));
                $value = Arr::path($vote, $path);
                $row[] = $this->exportUtils->parseCellValue($value);
            } elseif ($this->isSubdataBlocColumn($path, 'comment.')) {
                $path = substr($path, \strlen('comment.'));
                $value = Arr::path($comment, $path);
                $row[] = $this->exportUtils->parseCellValue($value);
            } elseif (isset($this->proposalHeaderMap[$path])) {
                $this->handleProposalValues($proposal, $columnName, $path, $row);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);
    }

    protected function extractValueFromArray(string $name, array $news, $path)
    {
        $related = Arr::path($news, $path);
        $object = array_map(
            function ($node) {
                return $node['title'];
            },
            array_filter($related, function ($item) use ($name) {
                return $name === $item['__typename'];
            })
        );

        return implode('', $object);
    }

    protected function handleProposalNewsValues(
        array $news,
        $columnName,
        string $columnPath,
        array &$row
    ): void {
        if (false !== strpos($columnName, 'authors')) {
            $paths = explode('.', $columnPath);
            array_shift($paths);
            $path = implode('.', $paths);
            $values = [];
            foreach (Arr::path($news, 'authors') as $author) {
                $values[] = Arr::path($author, $path);
            }
            $row[] = $this->exportUtils->parseCellValue(implode(', ', $values));
        } elseif ('proposal_news_linkedProposal' === $columnName) {
            $row[] = $this->extractValueFromArray('Proposal', $news, $columnPath);
        } elseif ('proposal_news_linkedProjects' === $columnName) {
            $row[] = $this->extractValueFromArray('Project', $news, $columnPath);
        } elseif ('proposal_news_themes' === $columnName) {
            $row[] = $this->extractValueFromArray('Theme', $news, $columnPath);
        } else {
            $value = Arr::path($news, $columnPath);
            $row[] = $this->exportUtils->parseCellValue($value);
        }
    }

    protected function insert(
        bool $isSimpleQuestion,
        array $array,
        $index,
        $val,
        int $questionNumber
    ) {
        $size = \count($array);
        if (!\is_int($index) || $index < 0 || $index > $size) {
            return -1;
        }

        $temp = \array_slice($array, 0, $index);
        $temp[$val] = $isSimpleQuestion
            ? "responses.${questionNumber}"
            : "evaluation.responses.${questionNumber}";

        return array_merge($temp, \array_slice($array, $index, $size));
    }

    protected function createHeadersMap(array $proposals): array
    {
        $questionNumber = 0;
        $proposalColumnNumber = \count(self::PROPOSAL_HEADER);
        $this->proposalHeaderMap = self::PROPOSAL_HEADER;
        $result = array_merge(self::PROPOSAL_HEADER, self::COLUMN_MAPPING_EXCEPT_PROPOSAL_HEADER);
        $sample = Arr::path(Arr::path($proposals, 'data.node.proposals.edges')[0], 'node');
        $questions = array_filter(
            array_map(function ($item) {
                if ('section' !== $item['question']['kind']) {
                    return $item['question']['title'];
                }

                return null;
            }, $sample['responses'])
        );

        $nbQuestions = \count($questions);
        foreach (array_reverse($questions) as $question) {
            $responseNumber = $nbQuestions - $questionNumber - 1;
            $this->proposalHeaderMap[$question] = "responses.${responseNumber}";

            $result = $this->insert(
                true,
                $result,
                $proposalColumnNumber,
                $question,
                $responseNumber
            );
            ++$questionNumber;
        }

        /** @var Questionnaire $evaluationForm */
        if (
            $this->currentStep->getProposalForm() &&
            ($evaluationForm = $this->currentStep->getProposalForm()->getEvaluationForm())
        ) {
            $evaluationFormAsArray = $evaluationForm
                ->getRealQuestions()
                ->filter(function (AbstractQuestion $question) {
                    return AbstractQuestion::QUESTION_TYPE_SECTION !== $question->getType();
                })
                ->toArray();
            /** @var AbstractQuestion $question */
            $nbEvaluationQuestions = \count($evaluationFormAsArray);
            $questionNumber = 0;
            foreach (array_reverse($evaluationFormAsArray) as $question) {
                $a = $nbQuestions - $questionNumber - 1;
                $this->proposalHeaderMap[$question->getTitle()] = "evaluation.responses.${a}";

                $result = $this->insert(
                    false,
                    $result,
                    $proposalColumnNumber + $nbQuestions,
                    $question->getTitle(),
                    $nbEvaluationQuestions - $questionNumber - 1
                );
                ++$questionNumber;
            }
        }

        return $result;
    }

    protected function getFilename(AbstractStep $selectionStep): string
    {
        return sprintf(
            '%s_%s.csv',
            $selectionStep->getProject()->getSlug(),
            $selectionStep->getSlug()
        );
    }

    protected function getProject(InputInterface $input): ?Project
    {
        if ($input->getArgument('projectId')) {
            return $this->projectRepository->find($input->getArgument('projectId'));
        }

        return null;
    }

    protected function getProposalVotesGraphQLQuery(
        string $proposalId,
        string $stepId,
        ?string $votesAfter = null,
        ?int $VOTES_PER_PAGE = self::VOTES_PER_PAGE
    ): string {
        $VOTE_INFOS_FRAGMENT = self::PROPOSAL_VOTE_INFOS_FRAGMENT;
        $USER_TYPE_FRAGMENT = self::USER_TYPE_INFOS_FRAGMENT;
        $AUTHOR_INFOS_FRAGMENT = self::AUTHOR_INFOS_FRAGMENT;

        if ($votesAfter) {
            $votesAfter = ', after: "' . $votesAfter . '"';
        }

        return <<<EOF
${VOTE_INFOS_FRAGMENT}
${USER_TYPE_FRAGMENT}
${AUTHOR_INFOS_FRAGMENT}
{
  node(id: "${proposalId}") {
    ... on Proposal {
      votes(includeUnpublished: true, stepId: "${stepId}", first: ${VOTES_PER_PAGE}${votesAfter}) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            ... voteInfos
          }
        }
      }
    }
  }
}
EOF;
    }

    protected function getProposalReportingsGraphQLQuery(
        string $proposalId,
        ?string $reportingsAfter = null,
        ?int $REPORTING_PER_PAGE = self::REPORTINGS_PER_PAGE
    ): string {
        $USER_TYPE_FRAGMENT = self::USER_TYPE_INFOS_FRAGMENT;
        $AUTHOR_INFOS_FRAGMENT = self::AUTHOR_INFOS_FRAGMENT;
        $REPORTING_INFOS_FRAGMENT = self::REPORTING_INFOS_FRAGMENT;

        if ($reportingsAfter) {
            $reportingsAfter = ', after: "' . $reportingsAfter . '"';
        }

        return <<<EOF
${REPORTING_INFOS_FRAGMENT}
${USER_TYPE_FRAGMENT}
${AUTHOR_INFOS_FRAGMENT}
{
  node(id: "${proposalId}") {
    ... on Proposal {
      reportings(first: ${REPORTING_PER_PAGE}{$reportingsAfter}) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            ...reportingInfos
          }
        }
      }
    }
  }
}
EOF;
    }

    protected function getProposalCommentsGraphQLQuery(
        string $proposalId,
        ?string $commentsAfter = null,
        ?int $COMMENTS_PER_PAGE = self::COMMENTS_PER_PAGE
    ): string {
        $COMMENTS_INFO_FRAGMENT = self::COMMENT_INFOS_FRAGMENT;
        $AUTHOR_INFOS_FRAGMENT = self::AUTHOR_INFOS_FRAGMENT;
        $REPORTING_INFOS_FRAGMENT = self::REPORTING_INFOS_FRAGMENT;
        $USER_TYPE_INFOS_FRAGMENT = self::USER_TYPE_INFOS_FRAGMENT;
        $COMMENT_VOTE_INFOS = self::COMMENT_VOTE_INFOS;

        if ($commentsAfter) {
            $commentsAfter = ', after: "' . $commentsAfter . '"';
        }

        return <<<EOF
${COMMENTS_INFO_FRAGMENT}
${AUTHOR_INFOS_FRAGMENT}
${REPORTING_INFOS_FRAGMENT}
${USER_TYPE_INFOS_FRAGMENT}
${COMMENT_VOTE_INFOS}

{
  node(id: "${proposalId}") {
    ... on Proposal {
      comments(first: ${COMMENTS_PER_PAGE}{$commentsAfter}) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            ... commentInfos
          }
        }
      }
    }
  }
}
EOF;
    }

    protected function getProposalNewsGraphQLQuery(
        string $proposalId,
        ?string $newsAfter = null,
        ?string $commentsAfter = null,
        ?string $votesAfter = null,
        ?string $reportingsAfter = null,
        ?int $NEWS_PER_PAGE = self::NEWS_PER_PAGE,
        ?int $VOTES_PER_PAGE = self::VOTES_PER_PAGE,
        ?int $REPORTINGS_PER_PAGE = self::REPORTINGS_PER_PAGE,
        ?int $COMMENTS_PER_PAGE = self::COMMENTS_PER_PAGE
    ): string {
        $USER_TYPE_FRAGMENT = self::USER_TYPE_INFOS_FRAGMENT;
        $AUTHOR_INFOS_FRAGMENT = self::AUTHOR_INFOS_FRAGMENT;
        $VOTES_INFOS_FRAGMENT = self::COMMENT_VOTE_INFOS_FRAGMENT;
        $REPORTING_INFOS_FRAGMENT = self::REPORTING_INFOS_FRAGMENT;

        if ($newsAfter) {
            $newsAfter = ', after: "' . $newsAfter . '"';
        }

        return <<<EOF
${USER_TYPE_FRAGMENT}
${AUTHOR_INFOS_FRAGMENT}
${REPORTING_INFOS_FRAGMENT}
${VOTES_INFOS_FRAGMENT}
{
  node(id: "${proposalId}") {
    ... on Proposal {
      news(first: ${NEWS_PER_PAGE}${newsAfter}) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            id
            title
            authors {
              ... authorInfos
            }
            relatedContent {
              __typename
              ... on Proposal {
                title
              }
              ... on Theme {
                title
              }
              ... on Project {
                title
              }
            }
            comments(first: ${COMMENTS_PER_PAGE}${commentsAfter}) {
              pageInfo {
                startCursor
                endCursor
                hasNextPage
              }
              edges {
                cursor
                node {
                  id
                  body
                  parent {
                    id
                  }
                  createdAt
                  updatedAt
                  author {
                    ... authorInfos
                    email
                  }
                  pinned
                  publicationStatus
                  votes(first: ${VOTES_PER_PAGE}${votesAfter}) {
                    pageInfo {
                      startCursor
                      endCursor
                      hasNextPage
                    }
                    edges {
                      cursor
                      node {
                        ... voteInfos
                      }
                    }
                  }
                  reportings(first: ${REPORTINGS_PER_PAGE}${reportingsAfter}) {
                    pageInfo {
                      startCursor
                      endCursor
                      hasNextPage
                    }
                    edges {
                      cursor
                      node {
                        ... reportingInfos
                      }
                    }
                  }
                }
              }
            }
            createdAt
            updatedAt
            commentable
            displayedOnBlog
            publishedAt
            abstract
            publicationStatus
          }
        }
      }
    }
  }
}
EOF;
    }

    protected function getProposalCommentReportingsGraphQLQuery(
        string $commentId,
        ?string $reportsAfter = null,
        ?int $REPORTINGS_PER_PAGE = self::REPORTINGS_PER_PAGE
    ): string {
        $USER_TYPE_FRAGMENT = self::USER_TYPE_INFOS_FRAGMENT;
        $AUTHOR_INFOS_FRAGMENT = self::AUTHOR_INFOS_FRAGMENT;
        $REPORTING_INFOS_FRAGMENT = self::REPORTING_INFOS_FRAGMENT;

        if ($reportsAfter) {
            $reportsAfter = ', after: "' . $reportsAfter . '"';
        }

        return <<<EOF
${REPORTING_INFOS_FRAGMENT}
${USER_TYPE_FRAGMENT}
${AUTHOR_INFOS_FRAGMENT}
{
  node(id: "${commentId}") {
    ... on Comment {
      reportings(first: ${REPORTINGS_PER_PAGE}${reportsAfter}) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            ... reportingInfos
          }
        }
      }
    }
  }
}
EOF;
    }

    protected function getProposalCommentVotesGraphQLQuery(
        string $commentId,
        ?string $votesAfter = null,
        ?int $VOTES_PER_PAGE = self::VOTES_PER_PAGE
    ): string {
        $VOTE_INFOS_FRAGMENT = self::COMMENT_VOTE_INFOS;
        $USER_TYPE_FRAGMENT = self::USER_TYPE_INFOS_FRAGMENT;
        $AUTHOR_INFOS_FRAGMENT = self::AUTHOR_INFOS_FRAGMENT;

        if ($votesAfter) {
            $votesAfter = ', after: "' . $votesAfter . '"';
        }

        return <<<EOF
${VOTE_INFOS_FRAGMENT}
${USER_TYPE_FRAGMENT}
${AUTHOR_INFOS_FRAGMENT}
{
  node(id: "${commentId}") {
    ... on Comment {
      votes(first: ${VOTES_PER_PAGE}${votesAfter}) {
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            ... commentVoteInfos
          }
        }
      }
    }
  }
}
EOF;
    }

    protected function getContributionsGraphQLQueryByProposalStep(
        AbstractStep $proposalStep,
        ?string $proposalAfter = null,
        ?string $votesAfter = null,
        ?string $commentsAfter = null,
        int $PROPOSALS_PER_PAGE = self::PROPOSALS_PER_PAGE,
        int $COMMENTS_PER_PAGE = self::COMMENTS_PER_PAGE,
        int $VOTES_PER_PAGE = self::VOTES_PER_PAGE
    ): string {
        $COMMENTS_INFO_FRAGMENT = self::COMMENT_INFOS_FRAGMENT;
        $USER_TYPE_FRAGMENT = self::USER_TYPE_INFOS_FRAGMENT;
        $NEWS_INFO_FRAGMENT = self::NEWS_INFO_FRAGMENT;
        $AUTHOR_INFOS_FRAGMENT = self::AUTHOR_INFOS_FRAGMENT;
        $REPORTING_INFOS_FRAGMENT = self::REPORTING_INFOS_FRAGMENT;
        $VOTE_INFOS_FRAGMENT = self::PROPOSAL_VOTE_INFOS_FRAGMENT;
        $COMMENT_VOTE_INFOS = self::COMMENT_VOTE_INFOS;

        if ($proposalAfter) {
            $proposalAfter = ', after: "' . $proposalAfter . '"';
        }
        if ($votesAfter) {
            $votesAfter = ', after: "' . $votesAfter . '"';
        }
        if ($commentsAfter) {
            $commentsAfter = ', after: "' . $commentsAfter . '"';
        }

        return <<<EOF
${COMMENTS_INFO_FRAGMENT}
${USER_TYPE_FRAGMENT}
${NEWS_INFO_FRAGMENT}
${AUTHOR_INFOS_FRAGMENT}
${REPORTING_INFOS_FRAGMENT}
${VOTE_INFOS_FRAGMENT}
${COMMENT_VOTE_INFOS}
{
  node(id: "{$proposalStep->getId()}") {
    ... on ProposalStep {
      proposals(orderBy: {field: CREATED_AT, direction: ASC}, includeUnpublished: true, first: ${PROPOSALS_PER_PAGE}{$proposalAfter}, trashedStatus: null, includeDraft: true) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            id
            comments(orderBy: {field: PUBLISHED_AT, direction: ASC}, first: ${COMMENTS_PER_PAGE}{$commentsAfter}) {
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                }
                edges {
                  cursor
                      node {
                        ... commentInfos
                      }  
                  }
            }
            reference
            id
            title
            allVotes: votes(stepId: "{$proposalStep->getId()}", includeUnpublished: false, first: 0) {
                totalCount
            }
            createdAt
            publishedAt
            updatedAt
            publicationStatus
            trashedAt
            trashedReason
            url
            author {
              ...authorInfos
            }
            status(step: "{$proposalStep->getId()}") {
              name
            }
            estimation
            category {
              name
            }
            theme {
              title
            }
            address {
              formatted
            }
            district {
              name
            }
            media {
              url
            }
            summary
            bodyText
            responses {
              ... on ValueResponse {
                question {
                  title
                  kind
                }
                formattedValue
              }
              ... on MediaResponse {
                question {
                  title
                  kind
                }
                medias {
                  url
                }
              }
            }
            evaluation {
              responses {
                ... on ValueResponse {
                  question {
                    id
                    title
                    kind
                  }
                  formattedValue
                }
                ... on MediaResponse {
                  question {
                    id
                    title
                    kind
                  }
                  medias {
                    url
                  }
                }
              }
            }
            votes(orderBy: {field: PUBLISHED_AT, direction: ASC}, stepId: "{$proposalStep->getId()}", first: ${VOTES_PER_PAGE}{$votesAfter}) {
              totalCount
              pageInfo {
                startCursor
                endCursor
                hasNextPage
              }
              edges {
                cursor
                node {
                  id
                  ... on ProposalVote {
                    ...voteInfos
                  }
                }
              }
            }
            news(orderBy: {field: CREATED_AT, direction: ASC}) {
              totalCount
              pageInfo {
                startCursor
                endCursor
                hasNextPage
              }
              edges {
                cursor
                node {
                  ...newsInfo
                }
              }
            }
          }
        }
      }
    }
  }
}
EOF;
    }

    private function printMemoryUsage(OutputInterface $output): void
    {
        if (!$output->isVerbose()) {
            return;
        }

        $output->write("\n");
        $output->writeln(
            sprintf(
                'Memory usage (currently) %dKB/ (max) %dKB',
                round(memory_get_usage(true) / 1024),
                memory_get_peak_usage(true) / 1024
            )
        );
    }
}
