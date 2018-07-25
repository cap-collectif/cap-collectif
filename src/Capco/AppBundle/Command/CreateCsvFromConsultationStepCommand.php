<?php
namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Utils\Arr;
use Overblog\GraphQLBundle\Request\Executor;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromConsultationStepCommand extends Command
{
    protected const ARGUMENT_PER_PAGE = 100;
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
  expired
  published
  ...trashableInfos
  votesCount
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
 expired
}
EOF;

    protected const TRASHABLE_CONTRIBUTION_FRAGMENT = <<<'EOF'
fragment trashableInfos on TrashableContribution {
  trashed
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
  expired
  published
  ...trashableInfos
  votesCount
}
EOF;

    protected const SOURCE_HEADER_MAP = [
        'contributions_sources_id' => 'id',
        'contributions_sources_related_id' => 'related.id',
        'contributions_sources_related_kind' => 'related.kind',
        'contributions_sources_author_id' => 'author.id',
        'contributions_sources_trashed' => 'trashed',
        'contributions_sources_trashedAt' => 'trashedAt',
        'contributions_sources_trashedReason' => 'trashedReason',
        'contributions_sources_body' => 'body',
        'contributions_sources_createdAt' => 'createdAt',
        'contributions_sources_updatedAt' => 'updatedAt',
        'contributions_sources_expired' => 'expired',
        'contributions_sources_published' => 'published',
        'contributions_sources_votesCount' => 'votesCount',
    ];

    protected const VOTES_HEADER_MAP = [
        'contributions_votes_id' => 'id',
        'contributions_votes_author_id' => 'author.id',
        'contributions_votes_value' => 'value',
        'contributions_votes_createdAt' => 'createdAt',
        'contributions_votes_expired' => 'expired',
    ];

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
        'contributions_expired',
        'contributions_published',
        'contributions_trashed',
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
        'contributions_arguments_expired',
        'contributions_arguments_published',
        'contributions_arguments_trashed',
        'contributions_arguments_trashedAt',
        'contributions_arguments_trashedReason',
        'contributions_arguments_votesCount',
        // 'contributions_votes_id',
        // 'contributions_votes_author_id',
        // 'contributions_votes_value',
        // 'contributions_votes_createdAt',
        // 'contributions_votes_expired',
        'contributions_reportings_related_id',
        'contributions_reportings_related_kind',
        'contributions_reportings_id',
        'contributions_reportings_author_id',
        'contributions_reportings_type',
        'contributions_reportings_body',
        'contributions_reportings_createdAt',
        // 'contributions_sources_id',
        // 'contributions_sources_related_id',
        // 'contributions_sources_related_kind',
        // 'contributions_sources_author_id',
        // 'contributions_sources_trashed',
        // 'contributions_sources_trashedAt',
        // 'contributions_sources_trashedReason',
        // 'contributions_sources_body',
        // 'contributions_sources_createdAt',
        // 'contributions_sources_updatedAt',
        // 'contributions_sources_expired',
        // 'contributions_sources_published',
        // 'contributions_sources_votesCount',
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
        'contributions_arguments_expired' => 'expired',
        'contributions_arguments_published' => 'published',
        'contributions_arguments_trashed' => 'trashed',
        'contributions_arguments_trashedAt' => 'trashedAt',
        'contributions_arguments_trashedReason' => 'trashedReason',
        'contributions_arguments_votesCount' => 'votesCount',
    ];

    protected $contributionHeaderMap = [
        'contributions_id' => 'id',
        'contributions_author_id' => 'author.id',
        'contributions_section_title' => 'section.title',
        'contributions_title' => 'title',
        'contributions_bodyText' => 'bodyText',
        'contributions_createdAt' => 'createdAt',
        'contributions_updatedAt' => 'updatedAt',
        'contributions_url' => 'url',
        'contributions_expired' => 'expired',
        'contributions_published' => 'published',
        'contributions_trashed' => 'trashed',
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
        'contributions_arguments_related_id' => 'related.id',
        'contributions_arguments_related_kind' => 'related.kind',
        'contributions_arguments_id' => 'id',
        'contributions_arguments_author_id' => 'author.id',
        'contributions_arguments_type' => 'type',
        'contributions_arguments_body' => 'body',
        'contributions_arguments_createdAt' => 'createdAt',
        'contributions_arguments_updatedAt' => 'updatedAt',
        'contributions_arguments_url' => 'url',
        'contributions_arguments_expired' => 'expired',
        'contributions_arguments_published' => 'published',
        'contributions_arguments_trashed' => 'trashed',
        'contributions_arguments_trashedAt' => 'trashedAt',
        'contributions_arguments_trashedReason' => 'trashedReason',
        'contributions_arguments_votesCount' => 'votesCount',
        'contributions_votes_id' => 'votes.id',
        'contributions_votes_author_id' => 'votes.author.id',
        'contributions_votes_value' => 'votes.value',
        'contributions_votes_createdAt' => 'votes.createdAt',
        'contributions_votes_expired' => 'votes.expired',
        'contributions_reportings_related_id' => 'reportings.related.id',
        'contributions_reportings_related_kind' => 'reportings.related.kind',
        'contributions_reportings_id' => 'reportings.id',
        'contributions_reportings_author_id' => 'reportings.author.id',
        'contributions_reportings_type' => 'reportings.type',
        'contributions_reportings_body' => 'reportings.body',
        'contributions_reportings_createdAt' => 'reportings.createdAt',
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
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setDescription('Create csv file from consultation step data');
    }

    protected function execute(InputInterface $input, OutputInterface $output): void
    {
        if (!$this->toggleManager->isActive('export')) {
            $output->writeln('Please enable "export" feature to run this command');

            return;
        }

        $steps = $this->consultationStepRepository->findAll();

        foreach ($steps as $step) {
            $this->currentStep = $step;
            $this->generateSheet($step);
        }

        $output->writeln('Done !');
    }

    protected function generateSheet(ConsultationStep $step): void
    {
        $filename = $this->getFilename($step);

        $this->writer = WriterFactory::create(Type::CSV);
        $this->writer->openToFile(sprintf('%s/web/export/%s', $this->projectRootDir, $filename));
        $this->writer->addRow(self::SHEET_HEADER);

        $contributionsQuery = $this->getContributionsGraphQLQueryByConsultationStep(
            $this->currentStep
        );

        $contributions = $this->executor->execute(null, [
            'query' => $contributionsQuery,
            'variables' => [],
        ])->toArray();

        $this->connectionTraversor->traverse(
            $contributions,
            'data.node.contributionConnection',
            function ($edge) {
                $contribution = $edge['node'];
                $this->addContributionRow($contribution);
            },
            function ($pageInfo) {
                return $this->getContributionsGraphQLQueryByConsultationStep(
                    $this->currentStep,
                    $pageInfo['endCursor']
                );
            }
        );
    }

    private function getContributionsGraphQLQueryByConsultationStep(
        ConsultationStep $consultationStep,
        ?string $contributionAfter = null,
        ?string $argumentAfter = null,
        int $argumentsPerPage = self::ARGUMENT_PER_PAGE,
        int $contributionPerPage = 100
    ): string {
        $argumentFragment = self::ARGUMENT_FRAGMENT;
        $authorFragment = self::AUTHOR_FRAGMENT;
        $relatedInfoFragment = self::CONTRIBUTION_FRAGMENT;
        $voteFragment = self::VOTE_FRAGMENT;
        $reportingFragment = self::REPORTING_FRAGMENT;
        $trashableFragment = self::TRASHABLE_CONTRIBUTION_FRAGMENT;
        $sourceFragment = self::SOURCE_FRAGMENT;

        if ($argumentAfter) {
            $argumentAfter = sprintf(', after: "%s"', $argumentAfter);
        }

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
{
  node(id: "{$consultationStep->getId()}") {
    ... on Consultation {
      contributionConnection(first: ${contributionPerPage}${contributionAfter}) {
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
            expired
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
            argumentsFor: arguments(first: 0, type: FOR) {
                totalCount
            }
            argumentsAgainst: arguments(first: 0, type: AGAINST) {
                totalCount
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
            arguments(first: ${argumentsPerPage}${argumentAfter}) {
              totalCount
              edges {
                cursor
                node {
                  ...argumentInfos
                }
              }
              pageInfo {
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
              ...reportInfos
            }
            versions {
                totalCount
                edges {
                    cursor
                    node {
                        ...relatedInfos
                        id
                        ...authorInfos
                        title
                        bodyText
                        comment
                        createdAt
                        updatedAt
                        url
                        expired
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
                        argumentsFor: arguments(first: 0, type: FOR) {
                            totalCount
                        }
                        argumentsAgainst: arguments(first: 0, type: AGAINST) {
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
                          ...reportInfos
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
        $row = ['source'];

        foreach ($this->contributionHeaderMap as $path => $columnName) {
            if (isset(self::SOURCE_HEADER_MAP[$path])) {
                $row[] = $this->parseCellValue(Arr::path($source, self::SOURCE_HEADER_MAP[$path]));
            } elseif (isset($this->contributionHeaderMap[$columnName])) {
                $row = Arr::path($contribution, $this->contributionHeaderMap[$path]);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);
    }

    private function addContributionVotesRow($contribution, $vote): void
    {
        $row = ['vote'];

        foreach ($this->contributionHeaderMap as $path => $columnName) {
            if (isset(self::VOTES_HEADER_MAP[$path])) {
                $row[] = $this->parseCellValue(Arr::path($vote, self::VOTES_HEADER_MAP[$path]));
            } elseif (isset($this->contributionHeaderMap[$columnName])) {
                $row = Arr::path($contribution, $this->contributionHeaderMap[$path]);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);
    }

    private function addContributionRow($contribution): void
    {
        $row = ['opinion'];

        // we add a row for 1 Opinion.
        foreach ($this->contributionHeaderMap as $path => $columnName) {
            $row[] = isset($this->contributionHeaderMap[$path])
                ? $this->parseCellValue(
                    Arr::path($contribution, $this->contributionHeaderMap[$path])
                )
                : '';
        }

        $this->writer->addRow($row);

        // we add Opinion's votes rows.
        // $votes = Arr::path($contribution, 'votes');

        // foreach ($votes as $vote) {
        //     $this->addContributionVotesRow($contribution, $vote);
        // }

        // we add Opinion's Sources rows.
        // $sources = Arr::path($contribution, 'sources');

        // foreach ($sources as $source) {
        //     $this->addContributionSourcesRow($contribution, $source);
        // }

        $argumentsQuery = $this->getContributionsArgumentsGraphQLQuery($contribution['id']);

        $contributionWithArguments = $this->executor->execute(null, [
            'query' => $argumentsQuery,
            'variables' => [],
        ])->toArray();

        $this->connectionTraversor->traverse(
            $contributionWithArguments,
            'data.node.arguments',
            function ($edge) use ($contribution) {
                $argument = $edge['node'];
                $this->addContributionArgumentRow($argument, $contribution);
            },
            function ($pageInfo) use ($contribution) {
                return $this->getContributionsArgumentsGraphQLQuery(
                    $contribution['id'],
                    $pageInfo['endCursor']
                );
            }
        );
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
    ... on Opinion {
      arguments(first: ${argumentsPerPage}${argumentAfter}) {
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

    private function addContributionArgumentRow($argument, $contribution): void
    {
        $row = ['argument'];

        foreach ($this->contributionHeaderMap as $path => $columnName) {
            if (isset(self::ARGUMENT_HEADER_MAP[$path])) {
                $row[] = $this->parseCellValue(
                    Arr::path($argument, self::ARGUMENT_HEADER_MAP[$path])
                );
            } elseif (isset($this->contributionHeaderMap[$columnName])) {
                $row = Arr::path($contribution, $this->contributionHeaderMap[$path]);
            } else {
                $row[] = '';
            }
        }

        $this->writer->addRow($row);
    }

    protected function parseCellValue($value)
    {
        if (!\is_array($value)) {
            if (\is_bool($value)) {
                return true === $value ? 'Yes' : 'No';
            }

            return $value;
        }

        return $value;
    }
}
