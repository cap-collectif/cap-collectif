<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

const USER_FRAGMENT = '
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

const USER_HEADERS = [
    'user_id',
    'user_email',
    'user_userName',
    'user_TypeName',
    'user_createdAt',
    'user_updatedAt',
    'user_lastLogin',
    'user_rolesText',
    'user_consentExternalCommunication',
    'user_enabled',
    'user_isEmailConfirmed',
    'user_locked',
    'user_phoneConfirmed',
    'user_gender',
    'user_dateOfBirth',
    'user_websiteUrl',
    'user_biography',
    'user_address',
    'user_zipCode',
    'user_city',
    'user_phone',
    'user_profileUrl'
];

class CreateStepContributorsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    protected static $defaultName = 'capco:export:step-contributors';

    private $toggleManager;
    private $connectionTraversor;
    private $executor;
    private $logger;
    private $projectRootDir;
    private $stepRepository;

    public function __construct(
        GraphQlAclListener $listener,
        ConnectionTraversor $connectionTraversor,
        ExportUtils $exportUtils,
        Executor $executor,
        LoggerInterface $logger,
        Manager $toggleManager,
        AbstractStepRepository $abstractStepRepository,
        string $projectRootDir
    ) {
        $listener->disableAcl();
        $this->toggleManager = $toggleManager;
        $this->connectionTraversor = $connectionTraversor;
        $this->executor = $executor;
        $this->logger = $logger;
        $this->projectRootDir = $projectRootDir;

        $this->stepRepository = $abstractStepRepository;
        parent::__construct($exportUtils);
    }
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->toggleManager->isActive('export')) {
            $output->writeln('Please enable "export" feature to run this command');
            return;
        }
        $delimiter = $input->getOption('delimiter');

        $steps = $this->stepRepository->findAll();
        foreach ($steps as $step) {
            if ($step instanceof CollectStep || $step instanceof SelectionStep || $step instanceof QuestionnaireStep
                || $step instanceof Consultation){
                $fileName = 'participants_' . $step->getSlug() . '.csv';
                $this->generateSheet($step, $fileName, $delimiter);
                $this->executeSnapshot($input, $output, $fileName);
            }
        }
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setDescription('Create a csv file for each step');
    }

    public function generateSheet(AbstractStep $step, string $fileName, string $delimiter): void{
        $data = $this->executor
            ->execute('internal', [
                'query' => $this->getStepContributorsGraphQLQuery($step->getId()),
                'variables' => []
            ])
            ->toArray();

        if (!isset($data['data'])) {
            $this->logger->error('GraphQL Query Error: ' . $data['error']);
            $this->logger->info('GraphQL query: ' . json_encode($data));
        }
        $writer = WriterFactory::create(Type::CSV, $delimiter);
        $writer->openToFile(sprintf('%s/web/export/%s', $this->projectRootDir, $fileName));
        $writer->addRow(USER_HEADERS);
        $this->connectionTraversor->traverse(
            $data,
            'contributors',
            function ($edge) use ($writer) {
                $contributor = $edge['node'];
                $writer->addRow([
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
                ]);
            },
            function ($pageInfo) use ($step) {
                return $this->getStepContributorsGraphQLQuery(
                    $step->getId(),
                    $pageInfo['endCursor']
                );
            }
        );
        $writer->close();
        $this->logger->info(sprintf('Done generating %s/web/export/%s', $this->projectRootDir, $fileName));
    }

    private function getStepContributorsGraphQLQuery(
        string $stepId,
        ?string $userCursor = null
    ): string {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }
        $USER_FRAGMENT = USER_FRAGMENT;

        return <<<EOF
        query {
          node(id: "${stepId}") {
            ... on Consultation {
              contributors(first: 50 ${userCursor}) {
                edges {
                  cursor
                  node {
                    ${USER_FRAGMENT}
                  }
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                }
              }
            }
            ... on CollectStep {
              contributors(first: 50 ${userCursor}) {
                edges {
                  cursor   
                  node {
                    ${USER_FRAGMENT}
                  }              
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                }                
              }
            }
            ... on SelectionStep {
              contributors(first: 50 ${userCursor}) {
                edges {
                  cursor
                  node {
                    ${USER_FRAGMENT}
                  }               
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                }                
              }
            }
            ... on QuestionnaireStep {
              contributors(first: 50 ${userCursor}) {
                edges {
                  cursor
                  node {
                    ${USER_FRAGMENT}
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
EOF;
    }
}
