<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Utils\Arr;
use Overblog\GraphQLBundle\Request\Executor;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromConsultationStepCommand extends BaseExportCommand
{
    protected const CONTRIBUTION_PER_PAGE = 100;
    protected const VOTE_PER_PAGE = 100;
    protected const ARGUMENT_PER_PAGE = 100;
    protected const SOURCE_PER_PAGE = 100;
    protected const VERSION_PER_PAGE = 100;
    protected const REPORTING_PER_PAGE = 100;

    protected const ARGUMENT_FRAGMENT = <<<'EOF'
fragment argumentInfos on Argument {
  ...relatedInfos
  id
  ...authorInfos
  type
  body
  createdAt
  updatedAt
  url
  published
  ...trashableInfos
  votes(first: 0) {
    totalCount
  }
}
EOF;

    protected const CONTRIBUTION_FRAGMENT = <<<'EOF'
fragment relatedInfos on Contribution {
  related {
     id
     kind
  }
}
EOF;

    protected const VOTE_FRAGMENT = <<<'EOF'
fragment voteInfos on YesNoPairedVote {
 id
 ...authorInfos
 value
 createdAt
}
EOF;

    protected const TRASHABLE_CONTRIBUTION_FRAGMENT = <<<'EOF'
fragment trashableInfos on Trashable {
  trashed
  trashedStatus
  trashedAt
  trashedReason
}
EOF;

    protected const AUTHOR_FRAGMENT = <<<'EOF'
fragment authorInfos on ContributionWithAuthor {
  author {
    id
  }
}
EOF;

    protected const REPORTING_FRAGMENT = <<<'EOF'
fragment reportInfos on Reporting {
  ...relatedInfos
  id
  ...authorInfos
  type
  body
  createdAt
}
EOF;

    protected const SOURCE_FRAGMENT = <<<'EOF'
fragment sourceInfos on Source {
  ...relatedInfos
  id
  ...authorInfos
  body
  createdAt
  updatedAt
  published
  ...trashableInfos
  votes(first: 0) {
    totalCount
  }
}
EOF;

    protected const VERSION_FRAGMENT = <<<'EOF'
fragment versionInfos on Version {
    ...relatedInfos
    id
    ...authorInfos
    title
    bodyText
    comment
    createdAt
    updatedAt
    url
    published
    ...trashableInfos
    votesOk: votes(first: 0, value: YES) {
      totalCount
    }
    votesMitige: votes(first: 0, value: MITIGE) {
        totalCount
    }
    votesNo: votes(first: 0, value: NO) {
        totalCount
    }
    argumentsFor: arguments(first: 0, type: FOR, includeTrashed: true) {
        totalCount
    }
    argumentsAgainst: arguments(first: 0, type: AGAINST, includeTrashed: true) {
        totalCount
    }
    arguments {
      totalCount
      edges {
        node {
          ...argumentInfos
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
    }
    sources {
      totalCount
      edges {
        node {
          ...sourceInfos
        }
      }
      pageInfo {
          endCursor
          hasNextPage
      }
    }
    reportings {
      totalCount
      edges {
        node {
          ...reportInfos
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
    }
    votes {
        totalCount
        edges {
            node {
              ...voteInfos
            }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
    }
}
EOF;

    protected const SHEET_HEADER = [
        'type',
        'contributions_id',
        'contributions_author_id',
        'contributions_section_title',
        'contributions_title',
        'contributions_bodyText',
        'contributions_createdAt',
        'contributions_updatedAt',
        'contributions_url',
        'contributions_published',
        'contributions_trashed',
        'contributions_trashedStatus',
        'contributions_trashedAt',
        'contributions_trashedReason',
        'contributions_votesCount',
        'contributions_votesCountOk',
        'contributions_votesCountMitige',
        'contributions_votesCountNok',
        'contributions_argumentsCount',
        'contributions_argumentsCountFor',
        'contributions_argumentsCountAgainst',
        'contributions_sourcesCount',
        'contributions_versionsCount',
        'contributions_arguments_related_id',
        'contributions_arguments_related_kind',
        'contributions_arguments_id',
        'contributions_arguments_author_id',
        'contributions_arguments_type',
        'contributions_arguments_body',
        'contributions_arguments_createdAt',
        'contributions_arguments_updatedAt',
        'contributions_arguments_url',
        'contributions_arguments_published',
        'contributions_arguments_trashed',
        'contributions_arguments_trashedStatus',
        'contributions_arguments_trashedAt',
        'contributions_arguments_trashedReason',
        'contributions_arguments_votesCount',
        'contributions_votes_id',
        'contributions_votes_author_id',
        'contributions_votes_value',
        'contributions_votes_createdAt',
        'contributions_reportings_related_id',
        'contributions_reportings_related_kind',
        'contributions_reportings_id',
        'contributions_reportings_author_id',
        'contributions_reportings_type',
        'contributions_reportings_body',
        'contributions_reportings_createdAt',
        'contributions_sources_id',
        'contributions_sources_related_id',
        'contributions_sources_related_kind',
        'contributions_sources_author_id',
        'contributions_sources_trashed',
        'contributions_sources_trashedStatus',
        'contributions_sources_trashedAt',
        'contributions_sources_trashedReason',
        'contributions_sources_body',
        'contributions_sources_createdAt',
        'contributions_sources_updatedAt',
        'contributions_sources_published',
        'contributions_sources_votesCount',
        'contribution_versions_id',
        'contribution_versions_title',
        'contribution_versions_bodyText',
        'contribution_versions_createdAt',
        'contribution_versions_updatedAt',
    ];
    protected const SOURCE_HEADER_MAP = [
        'contributions_sources_id' => 'id',
        'contributions_sources_related_id' => 'related.id',
        'contributions_sources_related_kind' => 'related.kind',
        'contributions_sources_author_id' => 'author.id',
        'contributions_sources_trashed' => 'trashed',
        'contributions_sources_trashedStatus' => 'trashedStatus',
        'contributions_sources_trashedAt' => 'trashedAt',
        'contributions_sources_trashedReason' => 'trashedReason',
        'contributions_sources_body' => 'body',
        'contributions_sources_createdAt' => 'createdAt',
        'contributions_sources_updatedAt' => 'updatedAt',
        'contributions_sources_published' => 'published',
        'contributions_sources_votesCount' => 'votes.totalCount',
    ];

    protected const VOTES_HEADER_MAP = [
        'contributions_votes_id' => 'id',
        'contributions_votes_author_id' => 'author.id',
        'contributions_votes_value' => 'value',
        'contributions_votes_createdAt' => 'createdAt',
    ];

    protected const ARGUMENT_HEADER_MAP = [
        'contributions_arguments_related_id' => 'related.id',
        'contributions_arguments_related_kind' => 'related.kind',
        'contributions_arguments_id' => 'id',
        'contributions_arguments_author_id' => 'author.id',
        'contributions_arguments_type' => 'type',
        'contributions_arguments_body' => 'body',
        'contributions_arguments_createdAt' => 'createdAt',
        'contributions_arguments_updatedAt' => 'updatedAt',
        'contributions_arguments_url' => 'url',
        'contributions_arguments_published' => 'published',
        'contributions_arguments_trashed' => 'trashed',
        'contributions_arguments_trashedStatus' => 'trashedStatus',
        'contributions_arguments_trashedAt' => 'trashedAt',
        'contributions_arguments_trashedReason' => 'trashedReason',
        'contributions_arguments_votesCount' => 'votes.totalCount',
    ];

    protected const VERSION_HEADER_MAP = [
        'contribution_versions_id' => 'id',
        'contribution_versions_title' => 'title',
        'contribution_versions_bodyText' => 'bodyText',
        'contribution_versions_createdAt' => 'createdAt',
        'contribution_versions_updatedAt' => 'updatedAt',
    ];

    protected const REPORTING_HEADER_MAP = [
        'contributions_reportings_related_id' => 'related.id',
        'contributions_reportings_related_kind' => 'related.kind',
        'contributions_reportings_id' => 'id',
        'contributions_reportings_author_id' => 'author.id',
        'contributions_reportings_type' => 'type',
        'contributions_reportings_body' => 'body',
        'contributions_reportings_createdAt' => 'createdAt',
    ];

    protected $contributionHeaderMap =
        [
            'contributions_id' => 'id',
            'contributions_author_id' => 'author.id',
            'contributions_section_title' => 'section.title',
            'contributions_title' => 'title',
            'contributions_bodyText' => 'bodyText',
            'contributions_createdAt' => 'createdAt',
            'contributions_updatedAt' => 'updatedAt',
            'contributions_url' => 'url',
            'contributions_published' => 'published',
            'contributions_trashed' => 'trashed',
            'contributions_trashedStatus' => 'trashedStatus',
            'contributions_trashedAt' => 'trashedAt',
            'contributions_trashedReason' => 'trashedReason',
            'contributions_votesCount' => 'votes.totalCount',
            'contributions_votesCountOk' => 'votesOk.totalCount',
            'contributions_votesCountMitige' => 'votesMitige.totalCount',
            'contributions_votesCountNok' => 'votesNo.totalCount',
            'contributions_argumentsCount' => 'arguments.totalCount',
            'contributions_argumentsCountFor' => 'argumentsFor.totalCount',
            'contributions_argumentsCountAgainst' => 'argumentsAgainst.totalCount',
            'contributions_sourcesCount' => 'sources.totalCount',
            'contributions_versionsCount' => 'versions.totalCount',
        ] +
        self::ARGUMENT_HEADER_MAP +
        self::VOTES_HEADER_MAP +
        self::REPORTING_HEADER_MAP +
        self::SOURCE_HEADER_MAP +
        self::VERSION_HEADER_MAP;

    protected static $defaultName = 'capco:export:consultation';

    protected $toggleManager;
    protected $consultationStepRepository;
    protected $projectRootDir;
    protected $executor;
    protected $connectionTraversor;
    protected $listener;

    protected $currentStep;

    /**
     * @var WriterInterface
     */
    protected $writer;

    public function __construct(
        Manager $toggleManager,
        ConsultationStepRepository $consultationStepRepository,
        ExportUtils $exportUtils,
        Executor $executor,
        GraphQlAclListener $listener,
        ConnectionTraversor $connectionTraversor,
        string $projectRootDir
    ) {
        $listener->disableAcl();
        $this->executor = $executor;
        $this->toggleManager = $toggleManager;
        $this->consultationStepRepository = $consultationStepRepository;
        $this->projectRootDir = $projectRootDir;
        $this->connectionTraversor = $connectionTraversor;
        parent::__construct($exportUtils);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->setDescription('Create csv file from consultation step data');
    }

    protected function execute(InputInterface $input, OutputInterface $output): void
    {
        if (!$this->toggleManager->isActive('export')) {
            $output->writeln('Please enable "export" feature to run this command');

            return;
        }

        $steps = $this->consultationStepRepository->getAllStepsWithAProject();
        foreach ($steps as $key => $step) {
            $output->writeln(
                "\n<info>Exporting step " . ($key + 1) . '/' . \count($steps) . '</info>'
            );
            $this->currentStep = $step;
            $this->generateSheet($step, $output);
        }
        $output->writeln('Done !');
    }

    protected function generateSheet(ConsultationStep $step, OutputInterface $output): void
    {
        $filename = $this->getFilename($step);

        $this->writer = WriterFactory::create(Type::CSV);
        $this->writer->openToFile(sprintf('%s/web/export/%s', $this->projectRootDir, $filename));
        $this->writer->addRow(self::SHEET_HEADER);

        $contributionsQuery = $this->getContributionsGraphQLQueryByConsultationStep(
            $this->currentStep
        );

        $contributions = $this->executor
            ->execute('internal', [
                'query' => $contributionsQuery,
                'variables' => [],
            ])
            ->toArray();

        $totalCount = Arr::path($contributions, 'data.node.contributions.totalCount');
        $progress = new ProgressBar($output, $totalCount);

        $this->connectionTraversor->traverse(
            $contributions,
            'contributions',
            function ($edge) use ($progress) {
                $progress->advance();
                $contribution = $edge['node'];
                $this->addContributionOpinionRow($contribution);
            },
            function ($pageInfo) {
                return $this->getContributionsGraphQLQueryByConsultationStep(
                    $this->currentStep,
                    $pageInfo['endCursor']
                );
            }
        );

        $this->writer->close();
        $progress->finish();
    }

    private function getContributionsGraphQLQueryByConsultationStep(
        ConsultationStep $consultationStep,
        ?string $contributionAfter = null,
        int $contributionPerPage = self::CONTRIBUTION_PER_PAGE,
        int $argumentPerPage = self::ARGUMENT_PER_PAGE,
        int $sourcePerPage = self::SOURCE_PER_PAGE,
        int $reportingPerPage = self::REPORTING_PER_PAGE,
        int $votePerPage = self::VOTE_PER_PAGE,
        int $versionPerPage = self::VERSION_PER_PAGE
    ): string {
        $argumentFragment = self::ARGUMENT_FRAGMENT;
        $authorFragment = self::AUTHOR_FRAGMENT;
        $relatedInfoFragment = self::CONTRIBUTION_FRAGMENT;
        $voteFragment = self::VOTE_FRAGMENT;
        $reportingFragment = self::REPORTING_FRAGMENT;
        $trashableFragment = self::TRASHABLE_CONTRIBUTION_FRAGMENT;
        $sourceFragment = self::SOURCE_FRAGMENT;
        $versionFragment = self::VERSION_FRAGMENT;

        if ($contributionAfter) {
            $contributionAfter = sprintf(', after: "%s"', $contributionAfter);
        }

        return <<<EOF
${argumentFragment}
${authorFragment}
${relatedInfoFragment}
${voteFragment}
${reportingFragment}
${trashableFragment}
${sourceFragment}
${versionFragment}
{
  node(id: "{$consultationStep->getId()}") {
    ... on ConsultationStep {
      contributions(orderBy: {field: PUBLISHED_AT, direction: DESC}, first: ${contributionPerPage}${contributionAfter}, includeTrashed: true) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
          ... on Opinion {
            id
            ...authorInfos
            section {
              title
            }
            title
            bodyText
            createdAt
            updatedAt
            url
            published
            ...trashableInfos
            votesOk: votes(first: 0, value: YES) {
                totalCount
            }
            votesMitige: votes(first: 0, value: MITIGE) {
                totalCount
            }
            votesNo: votes(first: 0, value: NO) {
                totalCount
            }
            argumentsFor: arguments(first: 0, type: FOR, includeTrashed: true) {
                totalCount
            }
            argumentsAgainst: arguments(first: 0, type: AGAINST, includeTrashed: true) {
                totalCount
            }
            votes(first: ${votePerPage}) {
                totalCount
                edges {
                    cursor
                    node {
                        ...voteInfos
                    }
                }
                pageInfo {
                    startCursor
                    endCursor
                    hasNextPage
                }
            }
            arguments(first: ${argumentPerPage}, includeTrashed: true) {
              totalCount
              edges {
                cursor
                node {
                  ...argumentInfos
                }
              }
              pageInfo {
                startCursor
                endCursor
                hasNextPage
              }
            }
            sources(first: ${sourcePerPage}) {
                totalCount
                edges {
                    cursor
                    node {
                      ...sourceInfos
                    }
                }
                pageInfo {
                    startCursor
                    endCursor
                    hasNextPage
                }
            }
            reportings(first: ${reportingPerPage}) {
              totalCount
              edges {
              cursor
                node {
                  ...reportInfos
                }
              }
              pageInfo {
                startCursor
                endCursor
                hasNextPage
              }
            }
            versions(first: ${versionPerPage}) {
                totalCount
                edges {
                    cursor
                    node {
                        ...versionInfos
                    }
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

    private function getFilename(ConsultationStep $step): string
    {
        return sprintf('%s_%s.csv', $step->getProject()->getSlug(), $step->getSlug());
    }

    private function addContributionSourcesRow($contribution, $source): void
    {
        $this->addContributionRow('source', $source, $contribution, self::SOURCE_HEADER_MAP);
    }

    private function addContributionVotesRow($contribution, $vote): void
    {
        $this->addContributionRow('vote', $vote, $contribution, self::VOTES_HEADER_MAP);
    }

    private function addContributionReportingsRow($contribution, $reporting): void
    {
        $this->addContributionRow(
            'reportings',
            $reporting,
            $contribution,
            self::REPORTING_HEADER_MAP
        );
    }

    private function addContributionOpinionRow($contribution): void
    {
        $row = ['opinion'];

        // we add a row for 1 Opinion.
        foreach ($this->contributionHeaderMap as $path => $columnName) {
            $row[] = isset($this->contributionHeaderMap[$path])
                ? $this->exportUtils->parseCellValue(
                    Arr::path($contribution, $this->contributionHeaderMap[$path])
                )
                : '';
        }
        $this->writer->addRow($row);

        // we add Opinion's votes rows.
        $this->connectionTraversor->traverse(
            $contribution,
            'votes',
            function ($edge) use ($contribution) {
                $this->addContributionVotesRow($contribution, $edge['node']);
            },
            function ($pageInfos) use ($contribution) {
                return $this->getOpinionVotesGraphQLQuery(
                    $contribution['id'],
                    $pageInfos['endCursor']
                );
            }
        );

        // we add Opinion's sources rows.
        $this->connectionTraversor->traverse(
            $contribution,
            'sources',
            function ($edge) use ($contribution) {
                $this->addContributionSourcesRow($contribution, $edge['node']);
            },
            function ($pageInfos) use ($contribution) {
                return $this->getOpinionSourcesGraphQLQuery(
                    $contribution['id'],
                    $pageInfos['endCursor']
                );
            }
        );

        // we add Opinion's reportings rows.
        $this->connectionTraversor->traverse(
            $contribution,
            'reportings',
            function ($edge) use ($contribution) {
                $this->addContributionReportingsRow($contribution, $edge['node']);
            },
            function ($pageInfos) use ($contribution) {
                return $this->getOpinionReportingsGraphQLQuery(
                    $contribution['id'],
                    $pageInfos['endCursor']
                );
            }
        );

        // we add Opinion's arguments rows.
        $this->connectionTraversor->traverse(
            $contribution,
            'arguments',
            function ($edge) use ($contribution) {
                $this->addContributionArgumentRow($contribution, $edge['node']);
            },
            function ($pageInfo) use ($contribution) {
                return $this->getContributionsArgumentsGraphQLQuery(
                    $contribution['id'],
                    $pageInfo['endCursor']
                );
            }
        );

        // We add Opinion's versions rows.
        $this->connectionTraversor->traverse(
            $contribution,
            'versions',
            function ($edge) use ($contribution) {
                $this->addContributionVersionRow($contribution, $edge['node']);
            },
            function ($pageInfos) use ($contribution) {
                return $this->getOpinionVersionsGraphQLQuery(
                    $contribution['id'],
                    $pageInfos['endCursor']
                );
            }
        );
    }

    private function getOpinionVotesGraphQLQuery(
        string $opinionId,
        ?string $votesAfterCursor = null,
        int $votesPerPage = self::VOTE_PER_PAGE
    ): string {
        $authorFragment = self::AUTHOR_FRAGMENT;
        $voteFragment = self::VOTE_FRAGMENT;

        if ($votesAfterCursor) {
            $votesAfterCursor = sprintf(', after: "%s"', $votesAfterCursor);
        }

        return <<<EOF
${authorFragment}
${voteFragment}
{
  node(id: "${opinionId}") {
    ... on Opinion {
      votes(first: ${votesPerPage}${votesAfterCursor}) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            ...voteInfos
          }
        }
      }
    }
  }
}
EOF;
    }

    private function getOpinionSourcesGraphQLQuery(
        string $opinionId,
        ?string $sourcesAfterCursor = null,
        int $sourcesPerPage = self::SOURCE_PER_PAGE
    ): string {
        $authorFragment = self::AUTHOR_FRAGMENT;
        $relatedFragment = self::CONTRIBUTION_FRAGMENT;
        $trashableFragment = self::TRASHABLE_CONTRIBUTION_FRAGMENT;
        $sourceFragment = self::SOURCE_FRAGMENT;

        if ($sourcesAfterCursor) {
            $sourcesAfterCursor = sprintf(', after: "%s"', $sourcesAfterCursor);
        }

        return <<<EOF
${authorFragment}
${relatedFragment}
${trashableFragment}
${sourceFragment}
{
  node(id: "${opinionId}") {
    ... on Opinion {
      sources(first: ${sourcesPerPage}${sourcesAfterCursor}) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            ...sourceInfos
          }
        }
      }
    }
  }
}
EOF;
    }

    private function getOpinionReportingsGraphQLQuery(
        string $opinionId,
        ?string $reportingsAfterCursor = null,
        int $reportingPerPage = self::REPORTING_PER_PAGE
    ): string {
        $authorFragment = self::AUTHOR_FRAGMENT;
        $relatedFragment = self::CONTRIBUTION_FRAGMENT;
        $reportingFragment = self::REPORTING_FRAGMENT;

        if ($reportingsAfterCursor) {
            $reportingsAfterCursor = sprintf(', after: "%s"', $reportingsAfterCursor);
        }

        return <<<EOF
${authorFragment}
${relatedFragment}
${reportingFragment}
{
  node(id: "${opinionId}") {
    ... on Opinion {
      sources(first: ${reportingPerPage}${reportingsAfterCursor}) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            ...reportInfos
          }
        }
      }
    }
  }
}
EOF;
    }

    private function getOpinionVersionsGraphQLQuery(
        string $opinionId,
        ?string $versionsAfterCursor = null,
        int $versionPerPage = self::VERSION_PER_PAGE
    ): string {
        $authorFragment = self::AUTHOR_FRAGMENT;
        $relatedFragment = self::CONTRIBUTION_FRAGMENT;
        $trashableFragment = self::TRASHABLE_CONTRIBUTION_FRAGMENT;
        $argumentFragment = self::ARGUMENT_FRAGMENT;
        $sourceFragment = self::SOURCE_FRAGMENT;
        $reportingFragment = self::REPORTING_FRAGMENT;
        $voteFragment = self::VOTE_FRAGMENT;
        $versionFragment = self::VERSION_FRAGMENT;

        if ($versionsAfterCursor) {
            $versionsAfterCursor = sprintf(', after: "%s"', $versionsAfterCursor);
        }

        return <<<EOF
${authorFragment}
${relatedFragment}
${trashableFragment}
${argumentFragment}
${sourceFragment}
${reportingFragment}
${voteFragment}
${versionFragment}
{
  node(id: "${opinionId}") {
    ... on Opinion {
      sources(first: ${versionPerPage}${versionsAfterCursor}) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            ...versionInfos
          }
        }
      }
    }
  }
}
EOF;
    }

    private function getContributionsArgumentsGraphQLQuery(
        string $contributionId,
        ?string $argumentAfter = null,
        int $argumentsPerPage = self::ARGUMENT_PER_PAGE
    ): string {
        $argumentFragment = self::ARGUMENT_FRAGMENT;
        $relatedInfoFragment = self::CONTRIBUTION_FRAGMENT;
        $authorFragment = self::AUTHOR_FRAGMENT;
        $trashableFragment = self::TRASHABLE_CONTRIBUTION_FRAGMENT;

        if ($argumentAfter) {
            $argumentAfter = sprintf(', after: "%s"', $argumentAfter);
        }

        return <<<EOF
${argumentFragment}
${relatedInfoFragment}
${authorFragment}
${trashableFragment}
{
  node(id: "${contributionId}") {
    ... on Argumentable {
      arguments(first: ${argumentsPerPage}${argumentAfter}, includeTrashed: true) {
        totalCount
        pageInfo {
          startCursor
          endCursor
          hasNextPage
        }
        edges {
          cursor
          node {
            ...argumentInfos
          }
        }
      }
    }
  }
}
EOF;
    }

    private function addContributionArgumentRow($contribution, $argument): void
    {
        $this->addContributionRow('argument', $argument, $contribution, self::ARGUMENT_HEADER_MAP);
    }

    private function addContributionVersionRow($contribution, $version): void
    {
        $this->addContributionRow('version', $version, $contribution, self::VERSION_HEADER_MAP);
    }

    private function addContributionRow(string $type, $node, $contribution, $headerMap): void
    {
        $row = [$type];

        foreach ($this->contributionHeaderMap as $path => $columnName) {
            if (isset($headerMap[$path])) {
                $row[] = $this->exportUtils->parseCellValue(Arr::path($node, $headerMap[$path]));
            } elseif (isset($this->contributionHeaderMap[$columnName])) {
                $row = Arr::path($contribution, $this->contributionHeaderMap[$path]);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);
    }
}
