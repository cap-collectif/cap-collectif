<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Capco\AppBundle\Command\Utils\exportUtils;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\GraphQL\InfoResolver;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Utils\Arr;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Utils\Text;

class CreateCsvFromProposalStepCommand extends Command
{
    const PROPOSAL_HEADER_MAP = [
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
        'proposal_formattedAddress' => 'formattedAddress',
        'proposal_district_name' => 'district.name',
        'proposal_illustration' => 'media.url',
        'proposal_summary' => 'summary',
        'proposal_description' => 'bodyText',
    ];
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

    protected const SHEET_HEADERS = [
        'proposal_id',
        'proposal_reference',
        'proposal_title',
        'proposal_votes_totalCount',
        'proposal_createdAt',
        'proposal_publishedAt',
        'proposal_updatedAt',
        'proposal_publicationStatus',
        'proposal_trashedAt',
        'proposal_trashedReason',
        'proposal_link',
        'proposal_author_id',
        'proposal_author_username',
        'proposal_author_isEmailConfirmed',
        'proposal_author_email',
        'proposal_author_userType_id',
        'proposal_author_userType_name',
        'proposal_status_name',
        'proposal_estimation',
        'proposal_category_name',
        'proposal_theme_title',
        'proposal_formattedAddress',
        'proposal_district_name',
        'proposal_illustration',
        'proposal_summary',
        'proposal_description',
        'proposal_votes_id',
        'proposal_votes_createdAt',
        'proposal_votes_publishedAt',
        'proposal_votes_anonymous',
        'proposal_votes_author_id',
        'proposal_votes_author_username',
        'proposal_votes_author_isEmailConfirmed',
        'proposal_votes_ranking',
        'proposal_votes_author_userType_id',
        'proposal_votes_author_userType_name',
        'proposal_comments_id',
        'proposal_comments_body',
        'proposal_comments_parent',
        'proposal_comments_createdAt',
        'proposal_comments_publishedAt',
        'proposal_comments_updatedAt',
        'proposal_comments_author_id',
        'proposal_comments_author_username',
        'proposal_comments_author_isEmailConfirmed',
        'proposal_comments_author_userType_id',
        'proposal_comments_author_userType_name',
        'proposal_comments_author_email',
        'proposal_comments_pinned',
        'proposal_comments_publicationStatus',
        'proposal_comments_vote_id',
        'proposal_comments_vote_createdAt',
        'proposal_comments_vote_publishedAt',
        'proposal_comments_vote_published',
        'proposal_comments_vote_author_id',
        'proposal_comments_vote_author_username',
        'proposal_comments_vote_author_isEmailConfirmed',
        'proposal_comments_vote_author_userType_id',
        'proposal_comments_vote_author_userType_name',
        'proposal_news_id',
        'proposal_news_title',
        'proposal_news_themes',
        'proposal_news_linkedProjects',
        'proposal_news_linkedProposal',
        'proposal_news_createdAt',
        'proposal_news_updatedAt',
        'proposal_news_publishedAt',
        'proposal_news_publicationStatus',
        'proposal_news_commentable',
        'proposal_news_displayedOnBlog',
        'proposal_news_authors_id',
        'proposal_news_authors_username',
        'proposal_news_authors_isEmailConfirmed',
        'proposal_news_authors_userType_id',
        'proposal_news_authors_userType_name',
        'proposal_news_comments_id',
        'proposal_news_comments_body',
        'proposal_news_comments_parent',
        'proposal_news_comments_createdAt',
        'proposal_news_comments_updatedAt',
        'proposal_news_comments_author_id',
        'proposal_news_comments_author_username',
        'proposal_news_comments_author_isEmailConfirmed',
        'proposal_news_comments_author_userType_id',
        'proposal_news_comments_author_userType_name',
        'proposal_news_comments_author_email',
        'proposal_news_comments_pinned',
        'proposal_news_comments_publicationStatus',
        'proposal_news_comments_vote_id',
        'proposal_news_comments_vote_createdAt',
        'proposal_news_comments_vote_publishedAt',
        'proposal_news_comments_vote_published',
        'proposal_news_comments_vote_author_id',
        'proposal_news_comments_vote_author_username',
        'proposal_news_comments_vote_author_isEmailConfirmed',
        'proposal_news_comments_vote_author_userType_id',
        'proposal_news_comments_vote_author_userType_name',
        'proposal_news_comments_reportings_id',
        'proposal_news_comments_reportings_createdAt',
        'proposal_news_comments_reportings_published',
        'proposal_news_comments_reportings_author_id',
        'proposal_news_comments_reportings_author_username',
        'proposal_news_comments_reportings_author_isEmailConfirmed',
        'proposal_news_comments_reportings_author_userType_id',
        'proposal_news_comments_reportings_author_userType_name',
        'proposal_reportings_id',
        'proposal_reportings_body',
        'proposal_reportings_createdAt',
        'proposal_reportings_author_id',
        'proposal_reportings_author_username',
        'proposal_reportings_author_isEmailConfirmed',
        'proposal_reportings_author_userType_id',
        'proposal_reportings_author_userType_name',
    ];

    protected const PROPOSAL_NEWS_COMMENT_REPORTING_HEADER_MAP = [
        'proposal_news_comments_reportings_id' => 'id',
        'proposal_news_comments_reportings_createdAt' => 'createdAt',
        'proposal_news_comments_reportings_author_id' => 'author.id',
        'proposal_news_comments_reportings_author_username' => 'author.username',
        'proposal_news_comments_reportings_author_isEmailConfirmed' => 'author.isEmailConfirmed',
        'proposal_news_comments_reportings_author_userType_id' => 'author.userType.id',
        'proposal_news_comments_reportings_author_userType_name' => 'author.userType.name',
    ];

    protected const PROPOSAL_REPORTING_HEADER_MAP = [
        'proposal_reportings_id' => 'id',
        'proposal_reportings_body' => 'bodyText',
        'proposal_reportings_createdAt' => 'createdAt',
        'proposal_reportings_author_id' => 'author.id',
        'proposal_reportings_author_username' => 'author.username',
        'proposal_reportings_author_isEmailConfirmed' => 'author.isEmailConfirmed',
        'proposal_reportings_author_userType_id' => 'author.userType.id',
        'proposal_reportings_author_userType_name' => 'author.userType.name',
    ];

    protected const PROPOSAL_NEWS_HEADER_MAP = [
        'proposal_news_id' => 'id',
        'proposal_news_title' => 'title',
        'proposal_news_themes' => 'relatedContent',
        'proposal_news_linkedProjects' => 'relatedContent',
        'proposal_news_linkedProposal' => 'relatedContent',
        'proposal_news_createdAt' => 'createdAt',
        'proposal_news_updatedAt' => 'updatedAt',
        'proposal_news_publishedAt' => 'publishedAt',
        'proposal_news_publicationStatus' => 'publicationStatus',
        'proposal_news_commentable' => 'commentable',
        'proposal_news_displayedOnBlog' => 'displayedOnBlog',
        'proposal_news_authors_id' => 'authors.id',
        'proposal_news_authors_username' => 'authors.username',
        'proposal_news_authors_isEmailConfirmed' => 'authors.isEmailConfirmed',
        'proposal_news_authors_userType_id' => 'authors.userType.id',
        'proposal_news_authors_userType_name' => 'authors.userType.name',
    ];

    protected const PROPOSAL_NEWS_COMMENT_HEADER_MAP = [
        'proposal_news_comments_id' => 'id',
        'proposal_news_comments_body' => 'body',
        'proposal_news_comments_parent' => 'parent',
        'proposal_news_comments_createdAt' => 'createdAt',
        'proposal_news_comments_publishedAt' => 'publishedAt',
        'proposal_news_comments_updatedAt' => 'updatedAt',
        'proposal_news_comments_author_id' => 'author.id',
        'proposal_news_comments_author_username' => 'author.username',
        'proposal_news_comments_author_isEmailConfirmed' => 'author.isEmailConfirmed',
        'proposal_news_comments_author_userType_id' => 'author.userType.id',
        'proposal_news_comments_author_userType_name' => 'author.userType.name',
        'proposal_news_comments_author_email' => 'author.email',
        'proposal_news_comments_pinned' => 'pinned',
        'proposal_news_comments_publicationStatus' => 'publicationStatus',
    ];

    protected const PROPOSAL_NEWS_COMMENT_VOTE_HEADER_MAP = [
        'proposal_news_comments_vote_id' => 'id',
        'proposal_news_comments_vote_createdAt' => 'createdAt',
        'proposal_news_comments_vote_publishedAt' => 'publishedAt',
        'proposal_news_comments_vote_author_id' => 'author.id',
        'proposal_news_comments_vote_author_username' => 'author.username',
        'proposal_news_comments_vote_author_isEmailConfirmed' => 'author.isEmailConfirmed',
        'proposal_news_comments_vote_author_userType_id' => 'author.userType.id',
        'proposal_news_comments_vote_author_userType_name' => 'author.userType.name',
    ];

    protected const PROPOSAL_VOTE_HEADER_MAP = [
        'proposal_votes_id' => 'id',
        'proposal_votes_ranking' => 'ranking',
        'proposal_votes_createdAt' => 'createdAt',
        'proposal_votes_publishedAt' => 'publishedAt',
        'proposal_votes_anonymous' => 'anonymous',
        'proposal_votes_author_id' => 'author.id',
        'proposal_votes_author_username' => 'author.username',
        'proposal_votes_author_isEmailConfirmed' => 'author.isEmailConfirmed',
        'proposal_votes_author_userType_id' => 'author.userType.id',
        'proposal_votes_author_userType_name' => 'author.userType.name',
    ];

    protected const PROPOSAL_COMMENT_VOTE_HEADER_MAP = [
        'proposal_comments_vote_id' => 'id',
        'proposal_comments_vote_createdAt' => 'createdAt',
        'proposal_comments_vote_publishedAt' => 'publishedAt',
        'proposal_comments_vote_author_id' => 'author.id',
        'proposal_comments_vote_author_username' => 'author.username',
        'proposal_comments_vote_author_isEmailConfirmed' => 'author.isEmailConfirmed',
        'proposal_comments_vote_author_userType_id' => 'author.userType.id',
        'proposal_comments_vote_author_userType_name' => 'author.userType.name',
    ];

    protected const PROPOSAL_COMMENT_HEADER_MAP = [
        'proposal_comments_id' => 'id',
        'proposal_comments_body' => 'body',
        'proposal_comments_createdAt' => 'createdAt',
        'proposal_comments_publishedAt' => 'publishedAt',
        'proposal_comments_updatedAt' => 'updatedAt',
        'proposal_comments_author_id' => 'author.id',
        'proposal_comments_author_username' => 'author.username',
        'proposal_comments_author_isEmailConfirmed' => 'author.isEmailConfirmed',
        'proposal_comments_author_userType_id' => 'author.userType.id',
        'proposal_comments_author_userType_name' => 'author.userType.name',
        'proposal_comments_author_email' => 'author.email',
        'proposal_comments_pinned' => 'pinned',
        'proposal_comments_publicationStatus' => 'publicationStatus',
    ];

    protected const CUSTOM_QUESTIONS_HEADER_OFFSET = 21;

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
        parent::__construct();
    }

    protected function configure(): void
    {
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

        if (($project = $this->getProject($input))) {
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
                $this->currentStep = $step;
                $this->generateSheet($this->currentStep, $output);
                $this->printMemoryUsage($output);
            }
        }
    }

    protected function generateSheet(AbstractStep $step, OutputInterface $output): void
    {
        $fileName = $this->getFilename($step);
        $this->proposalHeaderMap = self::PROPOSAL_HEADER_MAP;
        if (!isset($this->currentData['data']) && isset($this->currentData['error'])) {
            $this->logger->error('GraphQL Query Error: ' . $this->currentData['error']);
            $this->logger->info('GraphQL query: ' . json_encode($this->currentData));
        }

        $proposalsQuery = $this->getContributionsGraphQLQueryByProposalStep($this->currentStep);
        $proposals = $this->executor
            ->execute('internal', [
                'query' => $proposalsQuery,
                'variables' => [],
            ])
            ->toArray();
        $totalCount = Arr::path($proposals, 'data.node.proposals.totalCount');

        // Prepare the export file.
        $this->writer = WriterFactory::create(Type::CSV);
        $this->writer->openToFile(sprintf('%s/web/export/%s', $this->projectRootDir, $fileName));

        if ($totalCount > 0) {
            $output->writeln('<info>Importing ' . $totalCount . ' proposals...</info>');

            $this->headersMap = $this->createHeadersMap(self::SHEET_HEADERS, $proposals);
            $this->writer->addRow(
                array_merge(['contribution_type'], array_values($this->headersMap))
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
            $this->writer->addRow(array_merge(['contribution_type'], self::SHEET_HEADERS));

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

    protected function addProposalRow(array $proposal, OutputInterface $output): void
    {
        $row = ['proposal'];

        foreach ($this->headersMap as $path => $columnName) {
            if (isset($this->proposalHeaderMap[$columnName])) {
                $row = $this->handleProposalValues($proposal, $columnName, $row);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);

        $reportingsQuery = $this->getProposalReportingsGraphQLQuery($proposal['id']);
        $proposalWithReportings = $this->executor
            ->execute('internal', [
                'query' => $reportingsQuery,
                'variables' => [],
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

        $votesQuery = $this->getProposalVotesGraphQLQuery(
            $proposal['id'],
            $this->currentStep->getId()
        );
        $proposalsWithVotes = $this->executor
            ->execute('internal', [
                'query' => $votesQuery,
                'variables' => [],
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

        $commentsQuery = $this->getProposalCommentsGraphQLQuery($proposal['id']);
        $proposalsWithComments = $this->executor
            ->execute('internal', [
                'query' => $commentsQuery,
                'variables' => [],
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

        $newsQuery = $this->getProposalNewsGraphQLQuery($proposal['id']);
        $proposalWithNews = $this->executor
            ->execute('internal', [
                'query' => $newsQuery,
                'variables' => [],
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

    protected function addProposalReportRow(array $report, array $proposal): void
    {
        $row = ['proposalReporting'];
        foreach ($this->headersMap as $path => $columnName) {
            if (isset(self::PROPOSAL_REPORTING_HEADER_MAP[$columnName])) {
                $value = Arr::path($report, self::PROPOSAL_REPORTING_HEADER_MAP[$columnName]);
                $cleanValue = Text::cleanNewline($value);
                $row[] = exportUtils::parseCellValue($cleanValue);
            } elseif (isset($this->proposalHeaderMap[$columnName])) {
                // copy proposal row
                $row = $this->handleProposalValues($proposal, $columnName, $row);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);
    }

    protected function addProposalVotesRow(array $vote, array $proposal): void
    {
        $row = ['proposalVote'];
        foreach ($this->headersMap as $path => $columnName) {
            if (isset(self::PROPOSAL_VOTE_HEADER_MAP[$columnName])) {
                $value = Arr::path($vote, self::PROPOSAL_VOTE_HEADER_MAP[$columnName]);
                $cleanValue = Text::cleanNewline($value);
                $row[] = exportUtils::parseCellValue($cleanValue);
            } elseif (isset($this->proposalHeaderMap[$columnName])) {
                // copy proposal row
                $row = $this->handleProposalValues($proposal, $columnName, $row);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);
    }

    protected function addProposalCommentRow(array $comment, array $proposal): void
    {
        $row = [$comment['kind']];

        foreach ($this->headersMap as $path => $columnName) {
            if (isset(self::PROPOSAL_COMMENT_HEADER_MAP[$columnName])) {
                $value = Arr::path($comment, self::PROPOSAL_COMMENT_HEADER_MAP[$columnName]);
                $cleanValue = Text::cleanNewline($value);
                $row[] = exportUtils::parseCellValue($cleanValue);
            } elseif (isset($this->proposalHeaderMap[$columnName])) {
                // copy proposal row
                $row = $this->handleProposalValues($proposal, $columnName, $row);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);

        $commentReportings = $this->getProposalCommentReportingsGraphQLQuery($comment['id']);
        $commentWithReportings = $this->executor
            ->execute('internal', [
                'query' => $commentReportings,
                'variables' => [],
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
                'variables' => [],
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
            if (isset(self::PROPOSAL_REPORTING_HEADER_MAP[$columnName])) {
                $value = Arr::path($report, self::PROPOSAL_REPORTING_HEADER_MAP[$columnName]);
                $row[] = exportUtils::parseCellValue($value);
            } elseif (isset($this->proposalHeaderMap[$columnName])) {
                // copy proposal row
                $row = $this->handleProposalValues($proposal, $columnName, $row);
            } elseif (isset(self::PROPOSAL_COMMENT_HEADER_MAP[$columnName])) {
                // copy comment row
                $value = Arr::path($comment, self::PROPOSAL_COMMENT_HEADER_MAP[$columnName]);
                $row[] = exportUtils::parseCellValue($value);
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
            if (isset(self::PROPOSAL_COMMENT_VOTE_HEADER_MAP[$columnName])) {
                $value = Arr::path($vote, self::PROPOSAL_COMMENT_VOTE_HEADER_MAP[$columnName]);
                $cleanValue = Text::cleanNewline($value);
                $row[] = exportUtils::parseCellValue($cleanValue);
            } elseif (isset($this->proposalHeaderMap[$columnName])) {
                // copy proposal row
                $row = $this->handleProposalValues($proposal, $columnName, $row);
            } elseif (isset(self::PROPOSAL_COMMENT_HEADER_MAP[$columnName])) {
                // copy comment row
                $value = Arr::path($comment, self::PROPOSAL_COMMENT_HEADER_MAP[$columnName]);
                $cleanValue = Text::cleanNewline($value);
                $row[] = exportUtils::parseCellValue($cleanValue);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);
    }

    protected function addProposalNewsRow(
        array $news,
        array $proposal,
        string $proposalNewsCursor
    ): void {
        $row = ['proposalNews'];
        foreach ($this->headersMap as $path => $columnName) {
            if (isset(self::PROPOSAL_NEWS_HEADER_MAP[$columnName])) {
                $this->handleProposalNewsValues($news, $columnName, $row);
            } elseif (isset($this->proposalHeaderMap[$columnName])) {
                // copy proposal row
                $row = $this->handleProposalValues($proposal, $columnName, $row);
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
        foreach ($this->headersMap as $path => $columnName) {
            if (isset(self::PROPOSAL_NEWS_COMMENT_HEADER_MAP[$columnName])) {
                $value = Arr::path($comment, self::PROPOSAL_NEWS_COMMENT_HEADER_MAP[$columnName]);
                $row[] = exportUtils::parseCellValue($value);
            } elseif (isset($this->proposalHeaderMap[$columnName])) {
                // copy proposal row
                $row = $this->handleProposalValues($proposal, $columnName, $row);
            } elseif (isset(self::PROPOSAL_NEWS_HEADER_MAP[$columnName])) {
                // copy news row
                $this->handleProposalNewsValues($news, $columnName, $row);
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
            if (isset(self::PROPOSAL_NEWS_COMMENT_VOTE_HEADER_MAP[$columnName])) {
                $value = Arr::path($vote, self::PROPOSAL_NEWS_COMMENT_VOTE_HEADER_MAP[$columnName]);
                $row[] = exportUtils::parseCellValue($value);
            } elseif (isset($this->proposalHeaderMap[$columnName])) {
                // copy proposal row
                $row = $this->handleProposalValues($proposal, $columnName, $row);
            } elseif (isset(self::PROPOSAL_NEWS_COMMENT_HEADER_MAP[$columnName])) {
                // copy comment row
                $value = Arr::path($comment, self::PROPOSAL_NEWS_COMMENT_HEADER_MAP[$columnName]);
                $row[] = exportUtils::parseCellValue($value);
            } elseif (isset(self::PROPOSAL_NEWS_HEADER_MAP[$columnName])) {
                // copy news row
                $this->handleProposalNewsValues($news, $columnName, $row);
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
            if (isset(self::PROPOSAL_NEWS_COMMENT_REPORTING_HEADER_MAP[$columnName])) {
                $value = Arr::path(
                    $report,
                    self::PROPOSAL_NEWS_COMMENT_REPORTING_HEADER_MAP[$columnName]
                );
                $row[] = exportUtils::parseCellValue($value);
            } elseif (isset($this->proposalHeaderMap[$columnName])) {
                // copy proposal row
                $row = $this->handleProposalValues($proposal, $columnName, $row);
            } elseif (isset(self::PROPOSAL_NEWS_COMMENT_HEADER_MAP[$columnName])) {
                // copy comment row
                $value = Arr::path($comment, self::PROPOSAL_NEWS_COMMENT_HEADER_MAP[$columnName]);
                $row[] = exportUtils::parseCellValue($value);
            } elseif (isset(self::PROPOSAL_NEWS_HEADER_MAP[$columnName])) {
                // copy news row
                $this->handleProposalNewsValues($news, $columnName, $row);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);
    }

    protected function handleProposalValues(array $proposal, $columnName, $row): array
    {
        if ('responses' === $this->proposalHeaderMap[$columnName]) {
            $values = Arr::path($proposal, 'responses');
            foreach ($values as $value) {
                if (isset($value['question']) && $value['question']['title'] === $columnName) {
                    if (isset($value['formattedValue'])) {
                        $row[] = Text::cleanNewline($value['formattedValue']);
                    } elseif (isset($value['medias'])) {
                        $urls = array_map(function (array $media) {
                            return $media['url'];
                        }, $value['medias']);
                        $row[] = implode(', ', $urls);
                    } else {
                        $row[] = '';
                    }

                    break;
                }
            }
        } elseif (
            'evaluation_responses' === $this->proposalHeaderMap[$columnName] &&
            Arr::path($proposal, 'evaluation.responses')
        ) {
            $values = Arr::path($proposal, 'evaluation.responses');
            foreach ($values as $value) {
                if (isset($value['question']) && $value['question']['title'] === $columnName) {
                    if (isset($value['formattedValue'])) {
                        $row[] = Text::cleanNewline($value['formattedValue']);
                    } elseif (isset($value['medias'])) {
                        $urls = array_map(function ($media) {
                            return $media['url'];
                        }, $value['medias']);
                        $row[] = implode(', ', $urls);
                    } else {
                        $row[] = '';
                    }

                    break;
                }
            }
        } elseif ('reference' === $this->proposalHeaderMap[$columnName]) {
            $value = Arr::path($proposal, $this->proposalHeaderMap[$columnName]);
            $cleanValue = Text::cleanNewline($value);
            $row[] = '"' . $cleanValue . '"';
        } else {
            $value = Arr::path($proposal, $this->proposalHeaderMap[$columnName]);
            $cleanValue = Text::cleanNewline($value);
            $row[] = exportUtils::parseCellValue($cleanValue);
        }

        return $row;
    }

    protected function handleProposalNewsValues(array $news, $columnName, &$row): void
    {
        if (false !== strpos($columnName, 'authors')) {
            $paths = explode('.', self::PROPOSAL_NEWS_HEADER_MAP[$columnName]);
            array_shift($paths);
            $path = implode('.', $paths);
            $values = [];
            foreach (Arr::path($news, 'authors') as $author) {
                $values[] = Arr::path($author, $path);
            }
            $row[] = exportUtils::parseCellValue(implode(', ', $values));
        } elseif ('proposal_news_linkedProposal' === $columnName) {
            $related = Arr::path($news, self::PROPOSAL_NEWS_HEADER_MAP[$columnName]);
            $proposal = array_map(
                function ($node) {
                    return $node['title'];
                },
                array_filter($related, function ($item) {
                    return 'Proposal' === $item['__typename'];
                })
            );
            $row[] = implode('', $proposal);
        } elseif ('proposal_news_linkedProjects' === $columnName) {
            $related = Arr::path($news, self::PROPOSAL_NEWS_HEADER_MAP[$columnName]);
            $projects = array_map(
                function ($node) {
                    return $node['title'];
                },
                array_filter($related, function ($item) {
                    return 'Project' === $item['__typename'];
                })
            );
            $row[] = implode(', ', $projects);
        } elseif ('proposal_news_themes' === $columnName) {
            $related = Arr::path($news, self::PROPOSAL_NEWS_HEADER_MAP[$columnName]);
            $themes = array_map(
                function ($node) {
                    return $node['title'];
                },
                array_filter($related, function ($item) {
                    return 'Theme' === $item['__typename'];
                })
            );
            $row[] = implode(', ', $themes);
        } else {
            $value = Arr::path($news, self::PROPOSAL_NEWS_HEADER_MAP[$columnName]);
            $row[] = exportUtils::parseCellValue($value);
        }
    }

    protected function insert($array, $index, $val)
    {
        $size = \count($array);
        if (!\is_int($index) || $index < 0 || $index > $size) {
            return -1;
        }

        $temp = \array_slice($array, 0, $index);
        $temp[] = $val;

        return array_merge($temp, \array_slice($array, $index, $size));
    }

    protected function createHeadersMap(array $headers, array $proposals): array
    {
        $result = $headers;
        $sample = Arr::path(Arr::path($proposals, 'data.node.proposals.edges')[0], 'node');
        $questions = array_filter(
            array_map(function ($item) {
                if ('section' !== $item['question']['kind']) {
                    return $item['question']['title'];
                }

                return null;
            }, $sample['responses'])
        );
        foreach ($questions as $question) {
            $this->proposalHeaderMap[$question] = 'responses';
        }
        foreach (\array_reverse($questions) as $question) {
            $result = $this->insert($result, self::CUSTOM_QUESTIONS_HEADER_OFFSET, $question);
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
            foreach (\array_reverse($evaluationFormAsArray) as $question) {
                $result = $this->insert(
                    $result,
                    self::CUSTOM_QUESTIONS_HEADER_OFFSET + \count($questions),
                    $question->getTitle()
                );
                $this->proposalHeaderMap[$question->getTitle()] = 'evaluation_responses';
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
        ?string $VOTES_PER_PAGE = self::VOTES_PER_PAGE
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
        ?string $REPORTING_PER_PAGE = self::REPORTINGS_PER_PAGE
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
        ?string $COMMENTS_PER_PAGE = self::COMMENTS_PER_PAGE
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
        ?string $NEWS_PER_PAGE = self::NEWS_PER_PAGE,
        ?string $VOTES_PER_PAGE = self::VOTES_PER_PAGE,
        ?string $REPORTINGS_PER_PAGE = self::REPORTINGS_PER_PAGE,
        ?string $COMMENTS_PER_PAGE = self::COMMENTS_PER_PAGE
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
        ?string $REPORTINGS_PER_PAGE = self::REPORTINGS_PER_PAGE
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
        ?string $VOTES_PER_PAGE = self::VOTES_PER_PAGE
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
        string $PROPOSALS_PER_PAGE = self::PROPOSALS_PER_PAGE,
        string $COMMENTS_PER_PAGE = self::COMMENTS_PER_PAGE,
        string $VOTES_PER_PAGE = self::VOTES_PER_PAGE
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
      proposals(includeUnpublished: true, first: ${PROPOSALS_PER_PAGE}{$proposalAfter}, trashedStatus: null) {
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
            comments(first: ${COMMENTS_PER_PAGE}{$commentsAfter}) {
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
            formattedAddress
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
            votes(stepId: "{$proposalStep->getId()}", first: ${VOTES_PER_PAGE}{$votesAfter}) {
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
            news {
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
