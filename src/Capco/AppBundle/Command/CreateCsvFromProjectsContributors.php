<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Utils\Arr;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromProjectsContributors extends ContainerAwareCommand
{
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
    website
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
        'profileUrl',
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
        parent::__construct();
    }

    protected function configure(): void
    {
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
        foreach ($projects as $p) {
            $project = $this->executor
                ->execute('internal', [
                    'query' => $this->getContributorsProjectGraphQLQuery($p['id']),
                    'variables' => [],
                ])
                ->toArray();

            $fileName = 'participants_' . $p['slug'] . '.csv';
            $this->writer = WriterFactory::create(Type::CSV);
            $this->writer->openToFile(
                sprintf('%s/web/export/%s', $this->projectRootDir, $fileName)
            );
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
                    $this->writer->addRow([
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
                        $contributor['website'],
                        $contributor['biography'],
                        $contributor['address'],
                        $contributor['zipCode'],
                        $contributor['city'],
                        $contributor['phone'],
                        $contributor['url'],
                    ]);
                    $progress->advance();
                },
                function ($pageInfo) use ($p) {
                    return $this->getContributorsProjectGraphQLQuery(
                        $p['id'],
                        $pageInfo['endCursor']
                    );
                }
            );
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
