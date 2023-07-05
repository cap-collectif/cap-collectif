<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Exception\IOException;
use Box\Spout\Common\Type;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
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
        'proposal_analyst_id' => 'analyst.id',
        'proposal_analyst_username' => 'analyst.username',
        'proposal_analyst_email' => 'analyst.email',
        'proposal_analyst_opinion' => 'state',
        'proposal_analyst_estimated_cost' => 'estimatedCost',
    ];

    public const DECISION_DEFAULT_HEADER = [
        'proposal_supervisor_id' => 'assessment.supervisor.id',
        'proposal_supervisor_username' => 'assessment.supervisor.username',
        'proposal_supervisor_email' => 'assessment.supervisor.email',
        'proposal_supervisor_comment' => 'assessment.body',
        'proposal_supervisor_CostEstimated' => 'assessment.estimatedCost',
        'proposal_supervisor_OfficialResponseDraft' => 'assessment.officialResponse',
        'proposal_supervisor_opinion' => 'assessment.state',

        'proposal_decision-maker_id' => 'decision.decisionMaker.id',
        'proposal_decision-maker_username' => 'decision.decisionMaker.username',
        'proposal_decision-maker_email' => 'decision.decisionMaker.email',
        'proposal_decision-maker_CostEstimated' => 'decision.estimatedCost',
        'proposal_decision-maker_OfficialResponseDraft' => 'decision.officialResponse.isPublished',
        'proposal_decision-maker_OfficialResponseDraft_Author' => 'decision.officialResponse.authors',
        'proposal_decision-maker_OfficialResponseDraft_Content' => 'decision.officialResponse.body',
        'proposal_decision-maker_decision' => 'decision.state',
        'proposal_decision-maker_decision_reason' => 'decision.refusedReason.name',
    ];

    protected const USER_INFOS_FRAGMENT = <<<'EOF'
        fragment userInfos on User {
            id
            username
            isEmailConfirmed
            email
        }
        EOF;

    protected const USER_INFOS_ANONYMOUS_FRAGMENT = <<<'EOF'
        fragment userInfos on User {
            id
            username
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
            ...userInfos
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
            analyst {
              ...userInfos
            }
            state
            estimatedCost
            responses {
              id
              __typename
              ...on ValueResponse{
                formattedValue
              }
              ... on MediaResponse {
                medias {
                  id
                  url
                }
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
    protected EntityManagerInterface $em;
    protected Executor $executor;
    protected GraphQlAclListener $listener;
    protected string $projectRootDir;
    protected UserRepository $userRepository;
    private ProjectRepository $projectRepository;
    private ConnectionTraversor $connectionTraversor;

    public function __construct(
        EntityManagerInterface $em,
        Executor $executor,
        GraphQlAclListener $listener,
        UserRepository $userRepository,
        ProjectRepository $projectRepository,
        ExportUtils $exportUtils,
        ConnectionTraversor $connectionTraversor,
        string $projectRootDir
    ) {
        parent::__construct($exportUtils);
        $listener->disableAcl();
        $this->configureSnapshot();
        $this->em = $em;
        $this->userRepository = $userRepository;
        $this->executor = $executor;
        $this->projectRootDir = $projectRootDir;
        $this->projectRepository = $projectRepository;
        $this->connectionTraversor = $connectionTraversor;
    }

    public function generateProjectProposalsCSV(
        InputInterface $input,
        OutputInterface $output,
        array $project,
        string $delimiter,
        bool $isOnlyDecision,
        bool $isVerbose,
        bool $projectAdmin = false
    ): void {
        $firstAnalysisStep = $project['node']['firstAnalysisStep'];
        $projectSlug = $project['node']['slug'];
        $projectId = $project['node']['id'];
        if (!$firstAnalysisStep) {
            if ($isVerbose) {
                $output->writeln("<fg=red>No firstAnalysisStep for project {$projectSlug}!</>");
            }

            return;
        }

        $output->writeln('<fg=green>Generating analysis of project ' . $projectSlug . '...</>');

        $fullPath = $this->getPath($projectSlug, $isOnlyDecision, $projectAdmin);

        $writer = WriterFactory::create(Type::CSV, $delimiter);
        if (null === $writer) {
            throw new \RuntimeException('Error while opening writer.');
        }

        try {
            $writer->openToFile($fullPath);
        } catch (IOException $e) {
            throw new \RuntimeException('Error while opening file: ' . $e->getMessage());
        }

        $headers = $this->computeHeaders($projectAdmin);

        $dynamicQuestionHeaderPart = $this->writeHeader(
            $writer,
            $isOnlyDecision,
            $firstAnalysisStep['form'],
            $headers
        );

        if (
            isset($firstAnalysisStep['proposals']['edges'])
            && 0 !== \count($firstAnalysisStep['proposals']['edges'])
        ) {
            $this->connectionTraversor->traverse(
                $project['node'],
                'firstAnalysisStep.proposals',
                function ($edge) use (
                    $writer,
                    $output,
                    $dynamicQuestionHeaderPart,
                    $isOnlyDecision,
                    $isVerbose,
                    $headers
                ) {
                    $proposal = $edge['node'];
                    $this->addProposalRow(
                        $writer,
                        $output,
                        $proposal,
                        $dynamicQuestionHeaderPart,
                        $isOnlyDecision,
                        $headers,
                        $isVerbose
                    );
                },
                function ($pageInfo) use ($isOnlyDecision, $projectId) {
                    if ($isOnlyDecision) {
                        return $this->getDecisionGraphQLQuery($projectId, $pageInfo['endCursor']);
                    }

                    return $this->getAnalysisGraphQLQuery($projectId, $pageInfo['endCursor']);
                }
            );
        } else {
            $output->writeln(
                '<fg=red>/!\ There is no analysis in any proposal -> generating empty export.</>'
            );
        }
        $writer->close();
        if (true === $input->getOption('updateSnapshot')) {
            $this->updateSnapshot(self::getFilename($projectSlug, $isOnlyDecision, $projectAdmin));
            $output->writeln('<info>Snapshot has been written !</info>');
        }
    }

    /**
     * We have to make sure the string is unique for each step.
     */
    public static function getFilename(
        string $projectSlug,
        bool $isOnlyDecision,
        bool $projectAdmin = false
    ): string {
        if ($isOnlyDecision) {
            return self::getShortenedFilename(
                "project-{$projectSlug}-decision",
                '.csv',
                $projectAdmin
            );
        }

        return self::getShortenedFilename("project-{$projectSlug}-analysis", '.csv', $projectAdmin);
    }

    public function writeHeader(
        $writer,
        bool $isOnlyDecision,
        array $firstAnalysisStepForm,
        array $headers
    ): array {
        $proposalHeaders = $headers['proposalHeaders'];
        $analystHeaders = $headers['analystHeaders'];
        $decisionHeaders = $headers['decisionHeaders'];

        $dynamicQuestionHeaderPart = [];
        if (!$isOnlyDecision) {
            $dynamicQuestionHeaderPart = $this->getDynamicQuestionHeaderForProject(
                $firstAnalysisStepForm
            );
            $writer->addRow(
                WriterEntityFactory::createRowFromArray(
                    array_keys(
                        array_merge($proposalHeaders, $analystHeaders, $dynamicQuestionHeaderPart)
                    )
                )
            );
        } else {
            $writer->addRow(
                WriterEntityFactory::createRowFromArray(
                    array_keys(array_merge($proposalHeaders, $decisionHeaders))
                )
            );
        }

        return $dynamicQuestionHeaderPart;
    }

    public function addProposalRow(
        WriterInterface $writer,
        OutputInterface $output,
        array $proposal,
        array $dynamicQuestionHeaderPart,
        bool $isOnlyDecision,
        array $headers,
        bool $isVerbose = false
    ): void {
        $defaultRowContent = [];
        $analyses = $proposal['analyses'] ?? [];
        $assessment = $proposal['assessment'] ?? [];
        $decision = $proposal['decision'] ?? [];
        if (!$analyses && !$assessment && !$decision) {
            if ($isVerbose) {
                $output->writeln("\t<fg=red>/!\\No analysis for proposal ${proposal['title']}.</>");
            }

            $output->writeln(
                "\t<info>/!\\ There is no analysis in this proposal -> generating empty export.</info>"
            );

            return;
        }
        if ($isVerbose) {
            $output->writeln("\t<info>Adding analysis of proposal ${proposal['title']}.</info>");
        }

        // We iterate over each column of a row to fill them
        foreach ($headers['proposalHeaders'] as $headerPath) {
            $cellValue = $this->getRowCellValue($proposal, $headerPath);
            if ('reference' === $headerPath) {
                $cellValue = '"' . $cellValue . '"';
            }
            $defaultRowContent[] = $cellValue;
        }

        if ($isOnlyDecision) {
            $this->setDecisionRows(
                $writer,
                $defaultRowContent,
                $proposal,
                $headers['decisionHeaders']
            );
        } else {
            $this->setAnalysisRows(
                $writer,
                $defaultRowContent,
                $proposal['analyses'],
                $dynamicQuestionHeaderPart,
                $headers['analystHeaders']
            );
        }
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

    public function getProposalQuestionAnswer(array $proposal, string $questionId): string
    {
        if (!isset($proposal['responses'])) {
            return '';
        }
        $match = array_values(
            array_filter(
                $proposal['responses'],
                static fn (array $response) => isset($response['question']['id'])
                    && $response['question']['id'] === $questionId
            )
        );

        if (\count($match) > 0) {
            $response = $match[0];

            switch ($response['__typename']) {
                case 'ValueResponse':
                    return $response['formattedValue'] ?? '';

                case 'MediaResponse':
                    $urls = array_map(
                        static fn (array $media) => $media['url'],
                        $response['medias']
                    );

                    return implode(' | ', $urls);
            }
        }

        return '';
    }

    public function setDecisionRows(
        WriterInterface $writer,
        array $defaultRowContent,
        array $proposal,
        array $decisionHeaders
    ): void {
        $dynamicRowContent = [];
        foreach ($decisionHeaders as $headerPath) {
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

    public function formatAuthors(array $authors): string
    {
        $authorUsernames = [];
        foreach ($authors as $author) {
            $authorUsernames[] = $author['username'];
        }

        return implode(', ', $authorUsernames);
    }

    public function setAnalysisRows(
        WriterInterface $writer,
        array $defaultRowContent,
        array $analyses,
        array $dynamicQuestionHeaderPart,
        array $analystHeaders
    ): void {
        foreach ($analyses as $analysis) {
            $dynamicRowContent = [];
            foreach ($analystHeaders as $headerPath) {
                $cellValue = $this->getRowCellValue($analysis, $headerPath);
                $dynamicRowContent[] = $cellValue;
            }
            foreach ($dynamicQuestionHeaderPart as $questionId) {
                $cellValue = $this->getProposalQuestionAnswer($analysis, $questionId);
                $dynamicRowContent[] = $cellValue;
            }

            $writer->addRow(
                WriterEntityFactory::createRowFromArray(
                    array_merge($defaultRowContent, $dynamicRowContent)
                )
            );
        }
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
        $projects = $this->projectRepository->findAllIdsWithSlugs();
        $output->writeln('<info>Starting generation of csv...</info>');
        foreach ($projects as $project) {
            $projectEntity = $this->projectRepository->find($project['id']);
            $owner = $projectEntity->getOwner();
            $isProjectAdmin = !($owner instanceof User && $owner->isAdmin());

            $projectId = GlobalId::toGlobalId('Project', $project['id']);

            $data = $this->getData($isOnlyDecision, $projectId, null, $isProjectAdmin);

            $this->generateProjectProposalsCSV(
                $input,
                $output,
                $data['data'],
                $delimiter,
                $isOnlyDecision,
                $isVerbose,
                $isProjectAdmin
            );

            if ($isProjectAdmin) {
                $data = $this->getData($isOnlyDecision, $projectId);
                $this->generateProjectProposalsCSV(
                    $input,
                    $output,
                    $data['data'],
                    $delimiter,
                    $isOnlyDecision,
                    $isVerbose
                );
            }
        }

        $output->writeln('Done writing.');

        return 0;
    }

    protected function getDecisionGraphQLQuery(
        string $projectId,
        ?string $cursor = null,
        bool $projectAdmin = false
    ): string {
        $AUTHOR_INFOS_FRAGMENT = $projectAdmin
            ? self::USER_INFOS_ANONYMOUS_FRAGMENT
            : self::USER_INFOS_FRAGMENT;
        $PROPOSAL_FRAGMENT = self::PROPOSAL_ANALYSIS_FRAGMENT;

        if ($cursor) {
            $cursor = ', after: "' . $cursor . '"';
        }

        return <<<EOF
            {$AUTHOR_INFOS_FRAGMENT}
            {$PROPOSAL_FRAGMENT}
            {
              node(id: "{$projectId}") {
                ...on Project {
                    id
                    slug
                    firstAnalysisStep {
                      form {
                        analysisConfiguration {
                          evaluationForm {
                            questions {
                              id
                              title
                            }
                          }
                        }
                      }
                      proposals(includeUnpublished: true{$cursor}) {
                        pageInfo {
                            hasNextPage
                            endCursor
                        }
                        edges {
                          cursor
                          node {
                            ...proposalInfos

                            assessment{
                              body
                              estimatedCost
                              officialResponse
                              state
                              body
                              supervisor{
                                ...userInfos
                              }
                            }

                            decision {
                              state
                              refusedReason{
                                name
                              }
                              estimatedCost
                              isApproved
                              officialResponse {
                                body
                                authors{
                                  username
                                }
                              }
                              decisionMaker{
                                ...userInfos
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

    protected function getAnalysisGraphQLQuery(
        string $projectId,
        ?string $cursor = null,
        bool $projectAdmin = false
    ): string {
        $AUTHOR_INFOS_FRAGMENT = $projectAdmin
            ? self::USER_INFOS_ANONYMOUS_FRAGMENT
            : self::USER_INFOS_FRAGMENT;

        $PROPOSAL_FRAGMENT = self::PROPOSAL_ANALYSIS_FRAGMENT;

        if ($cursor) {
            $cursor = ', after: "' . $cursor . '"';
        }

        return <<<EOF
            {$AUTHOR_INFOS_FRAGMENT}
            {$PROPOSAL_FRAGMENT}
            {
              node(id: "{$projectId}") {
                ...on Project {
                    id
                    slug
                    firstAnalysisStep {
                      proposals(includeUnpublished: true{$cursor}) {
                        pageInfo {
                           hasNextPage
                           endCursor
                        }
                        edges {
                          cursor
                          node {
                            ...proposalInfos
                          }
                        }
                      }
                      form {
                        analysisConfiguration {
                          evaluationForm {
                            questions {
                              id
                              title
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

    protected function getPath(
        string $projectSlug,
        bool $isOnlyDecision,
        bool $projectAdmin = false
    ): string {
        return $this->projectRootDir .
            '/public/export/' .
            self::getFilename($projectSlug, $isOnlyDecision, $projectAdmin);
    }

    private function computeHeaders(bool $isProjectAdmin): array
    {
        $proposalHeaders = self::PROPOSAL_DEFAULT_HEADER;
        $analystHeaders = self::ANALYST_DEFAULT_HEADER;
        $decisionHeaders = self::DECISION_DEFAULT_HEADER;

        if ($isProjectAdmin) {
            unset(
                $proposalHeaders['proposal_author_email'],
                $proposalHeaders['proposal_author_isEmailConfirmed'],
                $analystHeaders['proposal_analyst_email'],
                $decisionHeaders['proposal_supervisor_email'],
                $decisionHeaders['proposal_decision-maker_email']
            );
        }

        return compact('proposalHeaders', 'analystHeaders', 'decisionHeaders');
    }

    private function getData(
        bool $isOnlyDecision,
        string $projectId,
        ?string $cursor = null,
        bool $projectAdmin = false
    ): array {
        if ($isOnlyDecision) {
            $data = $this->executor
                ->execute('internal', [
                    'query' => $this->getDecisionGraphQLQuery($projectId, $cursor, $projectAdmin),
                    'variables' => [],
                ])
                ->toArray()
            ;
        } else {
            $data = $this->executor
                ->execute('internal', [
                    'query' => $this->getAnalysisGraphQLQuery($projectId, $cursor, $projectAdmin),
                    'variables' => [],
                ])
                ->toArray()
            ;
        }

        return $data;
    }

    private function getDynamicQuestionHeaderForProject(array $form): array
    {
        $qHeader = [];
        if (isset($form['analysisConfiguration']['evaluationForm']['questions'])) {
            $questions = $form['analysisConfiguration']['evaluationForm']['questions'];
            foreach ($questions as $question) {
                $qHeader[$question['title']] = $question['id'];
            }
        }

        return $qHeader;
    }
}
