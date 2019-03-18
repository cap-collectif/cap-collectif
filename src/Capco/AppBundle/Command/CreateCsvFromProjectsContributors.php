<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
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

    public function __construct(
        GraphQlAclListener $listener,
        ConnectionTraversor $connectionTraversor,
        Executor $executor,
        Manager $toggleManager,
        string $projectRootDir,
        LoggerInterface $logger
    ) {
        $listener->disableAcl();
        $this->connectionTraversor = $connectionTraversor;
        $this->executor = $executor;
        $this->logger = $logger;
        $this->toggleManager = $toggleManager;
        $this->projectRootDir = $projectRootDir;
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

        $data = $this->executor
            ->execute('internal', [
                'query' => $this->getProjectsContributorsGraphQLQuery(),
                'variables' => [],
            ])
            ->toArray();

        if (!isset($data['data'])) {
            $this->logger->error('GraphQL Query Error: ' . $data['errors']['message']);
            $this->logger->info('GraphQL query: ' . json_encode($data));
        }

        $totalCount = Arr::path($data, 'data.projects.totalCount');
        $progress = new ProgressBar($output, $totalCount);

        $this->connectionTraversor->traverse(
            $data,
            'projects',
            function ($edge, $pageInfo) use ($output, $progress) {
                $project = $edge['node'];
                $projectEndCursor = $pageInfo['endCursor'];

                $fileName =
                    (new \DateTime())->format('Y-m-d') .
                    '_participants_' .
                    $project['slug'] .
                    '.csv';
                $this->writer = WriterFactory::create(Type::CSV);
                $this->writer->openToFile(
                    sprintf('%s/web/export/%s', $this->projectRootDir, $fileName)
                );
                $this->writer->addRow(self::USER_HEADERS);
                $this->connectionTraversor->traverse(
                    $project,
                    'contributors',
                    function ($edge) {
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
                    },
                    function ($pageInfo) use ($projectEndCursor) {
                        return $this->getProjectsContributorsGraphQLQuery(
                            $projectEndCursor,
                            $pageInfo['endCursor']
                        );
                    }
                );
                $this->writer->close();
                $progress->advance();
                $output->writeln('The export file "' . $fileName . '" has been created.');
            },
            function ($pageInfo) {
                return $this->getProjectsContributorsGraphQLQuery($pageInfo['endCursor']);
            }
        );

        $progress->finish();
        $output->writeln('All projects contributors have been successfully exported!');
    }

    private function getProjectsContributorsGraphQLQuery(
        ?string $projectsCursor = null,
        ?string $userCursor = null
    ): string {
        if ($projectsCursor) {
            $projectsCursor = sprintf(', after: "%s"', $projectsCursor);
        }
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }

        $userFragment = self::USER_FRAGMENT;

        return <<<EOF
        query {
            projects(first: 100 ${projectsCursor}) {
                totalCount
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                }
                edges {
                  cursor
                  node {
                    slug
                    contributors(first: 50, ${userCursor}) {
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
        }
EOF;
    }
}
