<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Entity\Row;
use Box\Spout\Common\Exception\IOException;
use Box\Spout\Common\Type;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\AppBundle\Utils\Arr;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Request\Executor;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ExportAnalysisCSVCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    public const PROPOSAL_DEFAULT_HEADER = [
        'contribution_type' => 'id',
        'proposal_id' => 'id',
        'proposal_reference' => 'reference',
        'proposal_title' => 'title',
        'proposal_createdAt' => 'createdAt',
        'proposal_publishedAt' => 'publishedAt',
        'proposal_updatedAt' => 'updatedAt',
        'proposal_publicationStatus' => 'publicationStatus',
        'proposal_trashedAt' => 'trashedAt',
        'proposal_trashedReason' => 'trashedReason',
        'proposal_link' => 'adminUrl',

        'proposal_author_id' => 'author.id',
        'proposal_author_username' => 'author.username',
        'proposal_author_isEmailConfirmed' => 'author.isEmailConfirmed',
        'proposal_author_email' => 'author.email',
        'proposal_author_userType_name' => 'author.userType.name',

        'proposal_status_name' => 'status.name',
        'proposal_estimation' => 'estimation',
        'proposal_category_name' => 'category.name',
        'proposal_formattedAddress' => 'address.formatted',
        'proposal_district_name' => 'district.name',
        'proposal_summary' => 'summary',
        'proposal_description' => 'bodyText',
    ];

    public const ANALYST_DEFAULT_HEADER = [
        'proposal_analyst_id' => 'updatedBy.id',
        'proposal_analyst_username' => 'updatedBy.username',
        'proposal_analyst_email' => 'updatedBy.email',
        'proposal_analyst_comment' => 'comment',
        'proposal_analyst_opinion' => 'state',
        'proposal_analyst_estimated_cost' => 'estimatedCost',
    ];

    public const DECISION_DEFAULT_HEADER = [
        'proposal_supervisor_id' => 'assessment.updatedBy.id',
        'proposal_supervisor_username' => 'assessment.updatedBy.username',
        'proposal_supervisor_email' => 'assessment.updatedBy.email',
        'proposal_supervisor_comment' => 'assessment.body',
        'proposal_supervisor_CostEstimated' => 'assessment.estimatedCost',
        'proposal_supervisor_OfficialResponseDraft' => 'assessment.officialResponse',
        'proposal_supervisor_opinion' => 'assessment.state',

        'proposal_decision-maker_id' => 'decision.updatedBy.id',
        'proposal_decision-maker_username' => 'decision.updatedBy.username',
        'proposal_decision-maker_email' => 'decision.updatedBy.email',
        'proposal_decision-maker_CostEstimated' => 'decision.estimatedCost',
        'proposal_decision-maker_OfficialResponseDraft' => 'decision.post.publicationStatus',
        'proposal_decision-maker_OfficialResponseDraft_Author' => 'decision.post.authors',
        'proposal_decision-maker_OfficialResponseDraft_Content' => 'decision.post.body',
        'proposal_decision-maker_decision' => 'decision.state',
        'proposal_decision-maker_decision_reason' => 'decision.refusedReason.name',
    ];

    protected const ANALYST_FRAGMENT = <<<'EOF'
fragment analystInfos on User {
    id
    username
    email
}
EOF;

    protected const DECISION_MAKER_FRAGMENT = <<<'EOF'
fragment decisionMakerInfos on User {
    id
    username
    email
}
EOF;

    protected const SUPERVISOR_FRAGMENT = <<<'EOF'
fragment supervisorInfos on User {
    id
    username
    email
}
EOF;

    protected const PROPOSAL_ANALYSIS_FRAGMENT = <<<'EOF'
    
fragment proposalInfos on Proposal {
  id
  reference
  adminUrl
  title
  createdAt
  publishedAt
  updatedAt
  publicationStatus
  trashedAt
  trashedReason
  author {
    id
    username
    isEmailConfirmed
    email
    userType{name}
  }
  status{
    name
  }
  category{name}
  address{formatted}
  district{name}
  summary
  bodyText
  estimation
  analyses {
    updatedBy {
      ...analystInfos
    }
    comment
    state
    estimatedCost
    responses {
      id
      ...on ValueResponse{
        formattedValue
      }
      question {
        id
        title
      }
    }
  }
}
EOF;

    protected static $defaultName = 'capco:export:analysis';
    protected $em;
    protected $executor;
    protected $listener;
    protected $projectRootDir;
    protected $userRepository;
    private $projectRepository;
    private $header;

    public function __construct(
        EntityManagerInterface $em,
        Executor $executor,
        GraphQlAclListener $listener,
        UserRepository $userRepository,
        ExportUtils $exportUtils,
        string $projectRootDir
    ) {
        parent::__construct($exportUtils);
        $listener->disableAcl();
        $this->configureSnapshot();
        $this->em = $em;
        $this->userRepository = $userRepository;
        $this->executor = $executor;
        $this->projectRootDir = $projectRootDir;
    }

    public function getRowCellValue(array $proposal, string $headerCell)
    {
        $fragmentDot = explode('.', $headerCell);
        if (1 === \count($fragmentDot)) {
            return $proposal[$headerCell] ?? '';
        }
        $value = $proposal;
        foreach ($fragmentDot as $fragment) {
            if (!$value || ($value && !\array_key_exists($fragment, $value))) {
                return '';
            }
            $value = $value[$fragment];
        }

        return $value ?? '';
    }

    public function setAnalysisRows(
        WriterInterface $writer,
        array $defaultRowContent,
        array $analyses,
        array $dynamicQuestionHeaderPart
    ): void {
        foreach ($analyses as $analysis) {
            $dynamicRowContent = [];
            foreach (self::ANALYST_DEFAULT_HEADER as $headerKey => $headerPath) {
                $cellValue = $this->getRowCellValue($analysis, $headerPath);
                $dynamicRowContent[] = $cellValue;
            }
            foreach ($dynamicQuestionHeaderPart as $headerKey => $headerPath) {
                $cellValue = $this->getRowCellValue($analysis, $headerPath);
                $dynamicRowContent[] = $cellValue;
            }
            $writer->addRow(
                WriterEntityFactory::createRowFromArray(
                    array_merge($defaultRowContent, $dynamicRowContent)
                )
            );
        }
    }

    public function formatAuthors(array $authors): string
    {
        $authorUsernames = [];
        foreach ($authors as $author) {
            $authorUsernames[] = $author['username'];
        }

        return implode(', ', $authorUsernames);
    }

    public function setDecisionRows(
        WriterInterface $writer,
        array $defaultRowContent,
        array $proposal
    ): void {
        $dynamicRowContent = [];
        foreach (self::DECISION_DEFAULT_HEADER as $headerKey => $headerPath) {
            $cellValue = $this->getRowCellValue($proposal, $headerPath);
            $dynamicRowContent[] = \is_array($cellValue)
                ? $this->formatAuthors($cellValue)
                : $cellValue;
        }

        $writer->addRow(
            WriterEntityFactory::createRowFromArray(
                array_merge($defaultRowContent, $dynamicRowContent)
            )
        );
    }

    public function addProposalRows(
        WriterInterface $writer,
        OutputInterface $output,
        array $proposals,
        array $dynamicQuestionHeaderPart,
        bool $isOnlyDecision,
        bool $isVerbose = false
    ): void {
        $hasRow = false;
        foreach ($proposals as $proposal) {
            $defaultRowContent = [];
            $proposal = $proposal['node'];
            $analyses = $proposal['analyses'];
            if (!$analyses || 0 === \count($analyses)) {
                if ($isVerbose) {
                    $output->writeln(
                        "\t<fg=red>/!\\No analysis for proposal ${proposal['title']}.</>"
                    );
                }

                continue;
            }
            $hasRow = true;
            if ($isVerbose) {
                $output->writeln(
                    "\t<info>Adding analysis of proposal ${proposal['title']}.</info>"
                );
            }

            // We iterate over each column of a row to fill them
            foreach (self::PROPOSAL_DEFAULT_HEADER as $headerKey => $headerPath) {
                $cellValue = $this->getRowCellValue($proposal, $headerPath);
                $defaultRowContent[] = $cellValue;
            }

            if ($isOnlyDecision) {
                $this->setDecisionRows($writer, $defaultRowContent, $proposal);
            } else {
                $this->setAnalysisRows(
                    $writer,
                    $defaultRowContent,
                    $proposal['analyses'],
                    $dynamicQuestionHeaderPart
                );
            }
        }
        if (!$hasRow) {
            $output->writeln(
                "\t<info>/!\\ There is no analysis in any proposal -> generating empty export.</info>"
            );
        }
    }

    public function writeHeader($writer, bool $isOnlyDecision, array $firstAnalysisStepForm): array
    {
        $dynamicQuestionHeaderPart = [];
        if (!$isOnlyDecision) {
            $dynamicQuestionHeaderPart = $this->getDynamicQuestionHeaderForProject(
                $firstAnalysisStepForm
            );
            $writer->addRow(
                WriterEntityFactory::createRowFromArray(
                    array_keys(
                        array_merge(
                            self::PROPOSAL_DEFAULT_HEADER,
                            self::ANALYST_DEFAULT_HEADER,
                            $dynamicQuestionHeaderPart
                        )
                    )
                )
            );
        } else {
            $writer->addRow(
                WriterEntityFactory::createRowFromArray(
                    array_keys(
                        array_merge(self::PROPOSAL_DEFAULT_HEADER, self::DECISION_DEFAULT_HEADER)
                    )
                )
            );
        }

        return $dynamicQuestionHeaderPart;
    }

    public function generateProjectProposalsCSV(
        InputInterface $input,
        OutputInterface $output,
        array $projects,
        string $delimiter,
        bool $isOnlyDecision,
        bool $isVerbose
    ): void {
        $output->writeln('<info>Starting generation of csv...</info>');
        foreach ($projects as $project) {
            $firstAnalysisStep = $project['node']['firstAnalysisStep'];
            $projectSlug = $project['node']['slug'];
            if (!$firstAnalysisStep) {
                if ($isVerbose) {
                    $output->writeln("<fg=red>No firstAnalysisStep for project ${projectSlug}!</>");
                }

                continue;
            }

            $output->writeln('<fg=green>Generating analysis of project ' . $projectSlug . '...</>');

            $fullPath = $this->getPath($projectSlug, $isOnlyDecision);

            $writer = WriterFactory::create(Type::CSV, $delimiter);
            if (null === $writer) {
                throw new \RuntimeException('Error while opening writer.');
            }

            try {
                $writer->openToFile($fullPath);
            } catch (IOException $e) {
                throw new \RuntimeException('Error while opening file: ' . $e->getMessage());
            }

            $dynamicQuestionHeaderPart = $this->writeHeader(
                $writer,
                $isOnlyDecision,
                $firstAnalysisStep['form']
            );

            if (
                isset($firstAnalysisStep['proposals']['edges']) &&
                0 !== \count($firstAnalysisStep['proposals']['edges'])
            ) {
                $this->addProposalRows(
                    $writer,
                    $output,
                    $firstAnalysisStep['proposals']['edges'],
                    $dynamicQuestionHeaderPart,
                    $isOnlyDecision,
                    $isVerbose
                );
            } else {
                $output->writeln(
                    '<fg=red>/!\ There is no analysis in any proposal -> generating empty export.</>'
                );
            }
            $writer->close();
            if (true === $input->getOption('updateSnapshot')) {
                $this->updateSnapshot(self::getFilename($projectSlug, $isOnlyDecision));
                $output->writeln('<info>Snapshot has been written !</info>');
            }
        }
    }

    public static function getFilename(string $projectSlug, bool $isOnlyDecision): string
    {
        if ($isOnlyDecision) {
            return "project-${projectSlug}-decision.csv";
        }

        return "project-${projectSlug}-analysis.csv";
    }

    protected function getPath(string $projectSlug, bool $isOnlyDecision): string
    {
        return $this->projectRootDir .
            '/public/export/' .
            self::getFilename($projectSlug, $isOnlyDecision);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->addOption(
            'only-decisions',
            'o',
            InputOption::VALUE_NONE,
            'Only selecting decisions'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $delimiter = $input->getOption('delimiter');
        $isVerbose = $input->getOption('verbose');
        $isOnlyDecision = $input->getOption('only-decisions');
        if ($isOnlyDecision) {
            $data = $this->executor
                ->execute('internal', [
                    'query' => $this->getDecisionGraphQLQuery(),
                    'variables' => [],
                ])
                ->toArray();
            $data = Arr::path($data, 'data.projects.edges');
        } else {
            $data = $this->executor
                ->execute('internal', [
                    'query' => $this->getAnalysisGraphQLQuery(),
                    'variables' => [],
                ])
                ->toArray();
            $data = Arr::path($data, 'data.projects.edges');
        }
        $this->generateProjectProposalsCSV(
            $input,
            $output,
            $data,
            $delimiter,
            $isOnlyDecision,
            $isVerbose
        );

        $output->writeln('Done writing.');

        return 0;
    }

    protected function getDecisionGraphQLQuery(): string
    {
        $ANALYST_FRAGMENT = self::ANALYST_FRAGMENT;
        $DECISION_MAKER_FRAGMENT = self::DECISION_MAKER_FRAGMENT;
        $SUPERVISOR_FRAGMENT = self::SUPERVISOR_FRAGMENT;
        $PROPOSAL_FRAGMENT = self::PROPOSAL_ANALYSIS_FRAGMENT;

        return <<<EOF
${ANALYST_FRAGMENT}
${DECISION_MAKER_FRAGMENT}
${SUPERVISOR_FRAGMENT}
${PROPOSAL_FRAGMENT}
{
  projects {
    edges {
      node {
        id
        slug
        firstAnalysisStep {
          form {
            analysisConfiguration {
              evaluationForm {
                questions {
                  title
                }
              }
            }
          }
          proposals(includeUnpublished: true) {
            edges {
              node {
                ...proposalInfos
                
                assessment{
                  body
                  estimatedCost
                  officialResponse
                  state
                  body
                  updatedBy{
                    ...supervisorInfos
                  }
                }
                
                decision {
                  state
                  refusedReason{
                    name
                  }
                  estimatedCost
                  isApproved
                  post {

                    title
                    body
                    
                    authors{
                      username
                    }
                  }
                	updatedBy{
                    ...decisionMakerInfos
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

    protected function getAnalysisGraphQLQuery(): string
    {
        $ANALYST_FRAGMENT = self::ANALYST_FRAGMENT;
        $PROPOSAL_FRAGMENT = self::PROPOSAL_ANALYSIS_FRAGMENT;

        return <<<EOF
${ANALYST_FRAGMENT}
${PROPOSAL_FRAGMENT}
{
  projects {
    edges {
      node {
        id
        slug
        firstAnalysisStep {
          proposals(includeUnpublished: true) {
            edges {
              node {
                ...proposalInfos
              }
            }
          }
          form {
            analysisConfiguration {
              evaluationForm {
                questions {
                  title
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

    private function getDynamicQuestionHeaderForProject(array $form): array
    {
        $qHeader = [];
        if (isset($form['analysisConfiguration']['evaluationForm']['questions'])) {
            $questions = $form['analysisConfiguration']['evaluationForm']['questions'];
            $index = 0;
            foreach ($questions as $question) {
                $qHeader[$question['title']] = "responses.${index}.formattedValue";
                ++$index;
            }
        }

        return $qHeader;
    }
}
