<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Helper\GraphqlQueryAndCsvHeaderHelper;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\AppBundle\Utils\Arr;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromProjectsContributorsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    private const USER_HEADERS = [
        'id',
        'email',
        'userName',
        'typeName',
        'createdAt',
        'updatedAt',
        'lastLogin',
        'rolesText',
        'consentInternalCommunication',
        'enabled',
        'isEmailConfirmed',
        'locked',
        'phoneConfirmed',
        'gender',
        'dateOfBirth',
        'websiteUrl',
        'biography',
        'address',
        'zipCode',
        'city',
        'phone',
        'profileUrl',
        'userIdentificationCode',
    ];
    /**
     * @var WriterInterface
     */
    protected $writer;
    protected ConnectionTraversor $connectionTraversor;
    protected GraphQlAclListener $listener;
    protected Executor $executor;
    protected string $projectRootDir;
    protected LoggerInterface $logger;
    protected Manager $toggleManager;
    protected ProjectRepository $projectRepository;

    public function __construct(
        GraphQlAclListener $listener,
        ConnectionTraversor $connectionTraversor,
        ExportUtils $exportUtils,
        Executor $executor,
        Manager $toggleManager,
        string $projectRootDir,
        ProjectRepository $repository,
        LoggerInterface $logger
    ) {
        $listener->disableAcl();
        $this->connectionTraversor = $connectionTraversor;
        $this->executor = $executor;
        $this->logger = $logger;
        $this->toggleManager = $toggleManager;
        $this->projectRootDir = $projectRootDir;
        $this->projectRepository = $repository;
        parent::__construct($exportUtils);
    }

    public static function getFilename(string $slug): string
    {
        return self::getShortenedFilename('participants_' . $slug);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName('capco:export:projects-contributors')->setDescription(
            'Create csv file from projects contributors data'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->toggleManager->isActive('export')) {
            return 1;
        }

        $projects = $this->projectRepository->findAllIdsWithSlugs();
        foreach ($projects as $data) {
            $id = GlobalId::toGlobalId('Project', $data['id']);

            $project = $this->executor
                ->execute('internal', [
                    'query' => $this->getContributorsProjectGraphQLQuery($id),
                    'variables' => [],
                ])
                ->toArray()
            ;

            $fileName = self::getFilename($data['slug']);
            $delimiter = $input->getOption('delimiter');
            $this->writer = WriterFactory::create(Type::CSV, $delimiter);
            $this->writer->openToFile(
                sprintf('%s/public/export/%s', $this->projectRootDir, $fileName)
            );

            $this->writer->addRow(WriterEntityFactory::createRowFromArray(self::USER_HEADERS));

            if (!isset($project['data'])) {
                $this->logger->error('GraphQL Query Error: ' . $project['error']);
                $this->logger->info('GraphQL query: ' . json_encode($project));
            }

            $totalCount = Arr::path($project, 'data.contributors.totalCount');
            $progress = new ProgressBar($output, (int) $totalCount);

            $this->connectionTraversor->traverse(
                $project,
                'contributors',
                function ($edge) use ($progress) {
                    $contributor = $edge['node'];
                    $row = array_map(
                        [$this->exportUtils, 'parseCellValue'],
                        [
                            $contributor['id'],
                            $contributor['email'],
                            $contributor['username'] ?? null,
                            ($contributor['userType'] ?? null) ? $contributor['userType']['name'] : null,
                            $contributor['createdAt'],
                            $contributor['updatedAt'] ?? null,
                            $contributor['lastLogin'] ?? null,
                            $contributor['rolesText'] ?? null,
                            $contributor['consentInternalCommunication'] ?? null,
                            $contributor['enabled'] ?? null,
                            $contributor['isEmailConfirmed'] ?? null,
                            $contributor['locked'] ?? null,
                            $contributor['phoneConfirmed'] ?? null,
                            $contributor['gender'] ?? null,
                            $contributor['dateOfBirth'],
                            $contributor['websiteUrl'] ?? null,
                            $contributor['biography'] ?? null,
                            $contributor['address'] ?? null,
                            $contributor['zipCode'] ?? null,
                            $contributor['city'] ?? null,
                            $contributor['phone'],
                            $contributor['url'] ?? null,
                            $contributor['userIdentificationCode'],
                        ]
                    );
                    $this->writer->addRow(WriterEntityFactory::createRowFromArray($row));
                    $progress->advance();
                },
                function ($pageInfo) use ($id) {
                    return $this->getContributorsProjectGraphQLQuery($id, $pageInfo['endCursor']);
                }
            );
            $this->executeSnapshot($input, $output, $fileName);

            $this->writer->close();
            $output->writeln('The export file "' . $fileName . '" has been created.');
            $progress->finish();
        }

        $output->writeln('All projects contributors have been successfully exported!');

        return 0;
    }

    private function getContributorsProjectGraphQLQuery(
        string $projectId,
        ?string $userCursor = null
    ): string {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }

        $userFragment = GraphqlQueryAndCsvHeaderHelper::USER_FRAGMENT;
        $contributorFragment = GraphqlQueryAndCsvHeaderHelper::CONTRIBUTOR_FRAGMENT;

        return <<<EOF
                    query {
                        node(id: "{$projectId}") {
                            ... on Project {
                                slug
                                contributors(first: 100{$userCursor}) {
                                  totalCount
                                  pageInfo {
                                    startCursor
                                    endCursor
                                    hasNextPage
                                  }
                                  edges {
                                    cursor
                                    node {
                                      {$contributorFragment}
                                      ...on User {
                                        {$userFragment}
                                      }
                                    }
                                  }
                                }
                            }
                        }
                    }
            EOF;
    }
}
