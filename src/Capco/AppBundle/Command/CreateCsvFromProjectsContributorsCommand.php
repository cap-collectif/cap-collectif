<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Utils\Arr;
use Capco\AppBundle\Toggle\Manager;
use Box\Spout\Writer\WriterInterface;
use Overblog\GraphQLBundle\Request\Executor;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\AppBundle\Repository\ProjectRepository;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromProjectsContributorsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    private const USER_FRAGMENT = '
    id
    email
    username
    userType {
      name
    }
    createdAt
    updatedAt
    lastLogin
    rolesText
    consentExternalCommunication
    enabled
    isEmailConfirmed
    locked
    phoneConfirmed
    gender
    dateOfBirth
    websiteUrl
    biography
    address
    zipCode
    city
    phone
    url
';

    private const USER_HEADERS = [
        'id',
        'email',
        'userName',
        'typeName',
        'createdAt',
        'updatedAt',
        'lastLogin',
        'rolesText',
        'consentExternalCommunication',
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
        'profileUrl'
    ];
    /**
     * @var WriterInterface
     */
    protected $writer;
    protected $connectionTraversor;
    protected $listener;
    protected $executor;
    protected $projectRootDir;
    protected $logger;
    protected $toggleManager;
    protected $projectRepository;

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
            return;
        }

        $projects = $this->projectRepository->findAllIdsWithSlugs();
        foreach ($projects as $data) {
            $id = GlobalId::toGlobalId('Project', $data['id']);

            $project = $this->executor
                ->execute('internal', [
                    'query' => $this->getContributorsProjectGraphQLQuery($id),
                    'variables' => []
                ])
                ->toArray();

            $fileName = 'participants_' . $data['slug'];
            if (strlen($fileName) > 230){
                $fileName = md5($fileName);
            }
            $fileName .= '.csv';
            $delimiter = $input->getOption('delimiter');
            $this->writer = WriterFactory::create(Type::CSV, $delimiter);
            $this->writer->openToFile(sprintf('%s/public/export/%s', $this->projectRootDir, $fileName));

            $this->writer->addRow(self::USER_HEADERS);

            if (!isset($project['data'])) {
                $this->logger->error('GraphQL Query Error: ' . $project['error']);
                $this->logger->info('GraphQL query: ' . json_encode($project));
            }

            $totalCount = Arr::path($project, 'data.contributors.totalCount');
            $progress = new ProgressBar($output, $totalCount);

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
                            $contributor['username'],
                            $contributor['userType'] ? $contributor['userType']['name'] : null,
                            $contributor['createdAt'],
                            $contributor['updatedAt'],
                            $contributor['lastLogin'],
                            $contributor['rolesText'],
                            $contributor['consentExternalCommunication'],
                            $contributor['enabled'],
                            $contributor['isEmailConfirmed'],
                            $contributor['locked'],
                            $contributor['phoneConfirmed'],
                            $contributor['gender'],
                            $contributor['dateOfBirth'],
                            $contributor['websiteUrl'],
                            $contributor['biography'],
                            $contributor['address'],
                            $contributor['zipCode'],
                            $contributor['city'],
                            $contributor['phone'],
                            $contributor['url']
                        ]
                    );
                    $this->writer->addRow($row);
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
    }

    private function getContributorsProjectGraphQLQuery(
        string $projectId,
        ?string $userCursor = null
    ): string {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }

        $userFragment = self::USER_FRAGMENT;

        return <<<EOF
        query {
            node(id: "${projectId}") {
                ... on Project {
                    slug
                    contributors(first: 100${userCursor}) {
                      totalCount
                      pageInfo {
                        startCursor
                        endCursor
                        hasNextPage
                      }
                      edges {
                        cursor
                        node {
                          ${userFragment}
                        }
                      }
                    }
                }
            }
        }
EOF;
    }
}
