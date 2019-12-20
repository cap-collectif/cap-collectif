<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Capco\AppBundle\Utils\Arr;
use Capco\AppBundle\Toggle\Manager;
use Box\Spout\Writer\WriterInterface;
use Overblog\GraphQLBundle\Request\Executor;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Helper\ProgressBar;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Symfony\Component\Console\Input\InputInterface;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Repository\ConsultationStepRepository;

class CreateCsvFromConsultationStepCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

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
 author {
    id
 }
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
    sources {
      totalCount
      edges {
        cursor
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
    votes {
        totalCount
        edges {
            cursor
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

    protected const COLUMN_MAPPING = [
        'type' => '',
        //contrib
        'contributions_id' => 'id',
        'contributions_author_id' => 'author.id',
        'contributions_consultation_title' => 'section.consultation.title',
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
        //context_elements
        'contributions_context_element_title' => 'appendix.appendixType.title',
        'contributions_context_element_bodyText' => 'appendix.bodyText',
        //vote
        'contributions_votes_id' => 'vote.id',
        'contributions_votes_related_id' => 'contribution.id',
        'contributions_votes_author_id' => 'vote.author.id',
        'contributions_votes_value' => 'vote.value',
        'contributions_votes_createdAt' => 'vote.createdAt',
        //argument
        'contributions_arguments_related_id' => 'argument.related.id',
        'contributions_arguments_related_kind' => 'argument.related.kind',
        'contributions_arguments_id' => 'argument.id',
        'contributions_arguments_author_id' => 'argument.author.id',
        'contributions_arguments_type' => 'argument.type',
        'contributions_arguments_body' => 'argument.body',
        'contributions_arguments_createdAt' => 'argument.createdAt',
        'contributions_arguments_updatedAt' => 'argument.updatedAt',
        'contributions_arguments_url' => 'argument.url',
        'contributions_arguments_published' => 'argument.published',
        'contributions_arguments_trashed' => 'argument.trashed',
        'contributions_arguments_trashedStatus' => 'argument.trashedStatus',
        'contributions_arguments_trashedAt' => 'argument.trashedAt',
        'contributions_arguments_trashedReason' => 'argument.trashedReason',
        'contributions_arguments_votesCount' => 'argument.votes.totalCount',
        //reportings
        'contributions_reportings_related_id' => 'reporting.related.id',
        'contributions_reportings_related_kind' => 'reporting.related.kind',
        'contributions_reportings_id' => 'reporting.id',
        'contributions_reportings_author_id' => 'reporting.author.id',
        'contributions_reportings_type' => 'reporting.type',
        'contributions_reportings_body' => 'reporting.body',
        'contributions_reportings_createdAt' => 'reporting.createdAt',
        //sources
        'contributions_sources_id' => 'source.id',
        'contributions_sources_related_id' => 'source.related.id',
        'contributions_sources_related_kind' => 'source.related.kind',
        'contributions_sources_author_id' => 'source.author.id',
        'contributions_sources_trashed' => 'source.trashed',
        'contributions_sources_trashedStatus' => 'source.trashedStatus',
        'contributions_sources_trashedAt' => 'source.trashedAt',
        'contributions_sources_trashedReason' => 'source.trashedReason',
        'contributions_sources_body' => 'source.body',
        'contributions_sources_createdAt' => 'source.createdAt',
        'contributions_sources_updatedAt' => 'source.updatedAt',
        'contributions_sources_published' => 'source.published',
        'contributions_sources_votesCount' => 'source.votes.totalCount',
        //version
        'contribution_versions_id' => 'version.id',
        'contribution_versions_title' => 'version.title',
        'contribution_versions_bodyText' => 'version.bodyText',
        'contribution_versions_createdAt' => 'version.createdAt',
        'contribution_versions_updatedAt' => 'version.updatedAt'
    ];

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
    )
    {
        $listener->disableAcl();
        $this->executor = $executor;
        $this->toggleManager = $toggleManager;
        $this->consultationStepRepository = $consultationStepRepository;
        $this->projectRootDir = $projectRootDir;
        $this->connectionTraversor = $connectionTraversor;
        parent::__construct($exportUtils);
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

    public function recurviselySearchValue(array $arr, $val, array &$row): void
    {
        foreach ($arr as $a) {
            if (isset($val[$a])) {
                $val = $val[$a];
            } else {
                $val = '';

                break;
            }
        }
        $row[] = $val;
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
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
            $this->executeSnapshot($input, $output, $this->getFilename($step));
        }
        $output->writeln('Done !');
    }

    protected function generateSheet(ConsultationStep $step, OutputInterface $output): void
    {
        $filename = $this->getFilename($step);

        $this->writer = WriterFactory::create(Type::CSV);
        $this->writer->openToFile(sprintf('%s/web/export/%s', $this->projectRootDir, $filename));
        $this->writer->addRow(array_keys(self::COLUMN_MAPPING));

        $contributionsQuery = $this->getContributionsGraphQLQueryByConsultationStep(
            $this->currentStep
        );

        $contributions = $this->executor
            ->execute('internal', [
                'query' => $contributionsQuery,
                'variables' => []
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
    ): string
    {
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
              consultation {
                title
              }
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
            appendices{
              appendixType{
                title
              }
              bodyText
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
              pageInfo {
                startCursor
                endCursor
                hasNextPage
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
        $fileName = sprintf('%s_%s.csv', $step->getProject()->getSlug(), $step->getSlug());
        if (strlen($fileName) < 255){
            return $fileName;
        }
        return md5($fileName) . '.csv';
    }

    private function addContributionSourcesRow($source): void
    {
        $this->addContributionRow('source', $source, 'source.');
    }

    private function addContributionVotesRow($vote, $contribution): void
    {
        $this->addContributionRow('vote', $vote, 'vote.', $contribution);
    }

    private function addContributionReportingsRow($reporting): void
    {
        $this->addContributionRow('reportings', $reporting, 'reporting.');
    }

    private function addContributionArgumentRow($argument): void
    {
        $this->addContributionRow('argument', $argument, 'argument.');
    }

    private function addContributionOpinionRow($contribution): void
    {
        $row = ['opinion'];

        // we add a row for 1 Opinion.
        foreach (self::COLUMN_MAPPING as $path => $columnName) {
            $arr = explode('.', $columnName);
            $val = $contribution;
            foreach ($arr as $a) {
                if (isset($val[$a])) {
                    $val = $val[$a];
                } else {
                    $val = '';

                    break;
                }
            }
            if ('type' !== $path) {
                $row[] = $val;
            }
        }
        $this->writer->addRow($row);

        // we add Opinion's votes rows.
        $this->connectionTraversor->traverse(
            $contribution,
            'votes',
            function ($edge) use ($contribution) {
                $this->addContributionVotesRow($edge['node'], $contribution);
            },
            function ($pageInfos) use ($contribution) {
                return $this->getOpinionVotesGraphQLQuery(
                    $contribution['id'],
                    $pageInfos['endCursor']
                );
            }
        );

        foreach ($contribution['appendices'] as $appendix) {
            $row = ['context_element', $contribution['id']];
            foreach (self::COLUMN_MAPPING as $path => $columnName) {
                if ($this->isSubdataBlocColumn($columnName, 'appendix.')) {
                    $arr = explode('.', substr($columnName, \strlen('appendix.')));
                    $this->recurviselySearchValue($arr, $appendix, $row);
                }else if ('type' !== $path && 'contributions_id' !== $path) {
                    $row[] = '';
                }
            }
            $this->writer->addRow($row);
        }

        // we add Opinion's sources rows.
        $this->connectionTraversor->traverse(
            $contribution,
            'sources',
            function ($edge) {
                $this->addContributionSourcesRow($edge['node']);
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
            function ($edge) {
                $this->addContributionReportingsRow($edge['node']);
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
            function ($edge) {
                $this->addContributionArgumentRow($edge['node']);
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
            function ($edge) {
                $this->addContributionVersionRow($edge['node']);
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
    ): string
    {
        $voteFragment = self::VOTE_FRAGMENT;

        if ($votesAfterCursor) {
            $votesAfterCursor = sprintf(', after: "%s"', $votesAfterCursor);
        }

        return <<<EOF
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
    ): string
    {
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
    ): string
    {
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
    ): string
    {
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
    ): string
    {
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

    private function addContributionVersionRow($version): void
    {
        $this->addContributionRow('version', $version, 'version.');

        if ($version['votes']['totalCount'] > 0) {
            // we add Opinion's votes rows.
            $this->connectionTraversor->traverse(
                $version,
                'votes',
                function ($edge) use ($version) {
                    $this->addContributionVotesRow($edge['node'], $version);
                },
                function ($pageInfos) use ($version) {
                    return $this->getOpinionVotesGraphQLQuery(
                        $version['id'],
                        $pageInfos['endCursor']
                    );
                }
            );
        }

        if ($version['sources']['totalCount'] > 0) {
            // we add Opinion's sources rows.
            $this->connectionTraversor->traverse(
                $version,
                'sources',
                function ($edge) {
                    $this->addContributionSourcesRow($edge['node']);
                },
                function ($pageInfos) use ($version) {
                    return $this->getOpinionSourcesGraphQLQuery(
                        $version['id'],
                        $pageInfos['endCursor']
                    );
                }
            );
        }

        if ($version['reportings']['totalCount'] > 0) {
            // we add Opinion's reportings rows.
            $this->connectionTraversor->traverse(
                $version,
                'reportings',
                function ($edge) {
                    $this->addContributionReportingsRow($edge['node']);
                },
                function ($pageInfos) use ($version) {
                    return $this->getOpinionReportingsGraphQLQuery(
                        $version['id'],
                        $pageInfos['endCursor']
                    );
                }
            );
        }

        if ($version['arguments']['totalCount'] > 0) {
            // we add Opinion's arguments rows.
            $this->connectionTraversor->traverse(
                $version,
                'arguments',
                function ($edge) {
                    $this->addContributionArgumentRow($edge['node']);
                },
                function ($pageInfo) use ($version) {
                    return $this->getContributionsArgumentsGraphQLQuery(
                        $version['id'],
                        $pageInfo['endCursor']
                    );
                }
            );
        }
    }

    private function addContributionRow(
        string $type,
        $node,
        string $submodulePath,
        $contribution = null
    ): void
    {
        $row = [$type];

        foreach (self::COLUMN_MAPPING as $path => $columnName) {
            // Ignore type column already filled
            if ('type' === $path) {
                continue;
            }
            // Check if is a "submodule" ie not an opinion but something deriving from it (sources, arguments...)
            if (null !== $submodulePath) {
                if ($this->isSubdataBlocColumn($columnName, $submodulePath)) {
                    // Get relative path for "module" using convention "${type}." but still customizable to prevent
                    // a contribution from having path beginning like this as well
                    $arr = explode('.', substr($columnName, \strlen($submodulePath)));
                    //In this case, we want to refer to the contribution link to the submodule
                } elseif ($this->isSubdataBlocColumn($columnName, 'contribution.')) {
                    $arr = explode('.', substr($columnName, \strlen('contribution.')));
                    $this->recurviselySearchValue($arr, $contribution, $row);

                    continue;
                } else {
                    $row[] = '';

                    continue;
                }
            } else {
                $arr = explode('.', $columnName);
            }
            $this->recurviselySearchValue($arr, $node, $row);
        }
        $this->writer->addRow($row);
    }
}
