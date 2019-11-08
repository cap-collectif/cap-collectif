<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\AppBundle\Utils\Arr;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromEventParticipantsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    const PUBLIC_USER_HEADERS_EVENTS = [
        'user_email',
        'user_firstname',
        'user_lastname',
        'user_privateRegistration'
    ];

    const USER_FRAGMENT = '
        id
        email
        username
        firstname
        lastname
    ';

    protected $writer;
    protected $connectionTraversor;
    protected $listener;
    protected $executor;
    protected $projectRootDir;
    protected $logger;
    protected $eventRepository;
    protected $manager;

    public function __construct(
        GraphQlAclListener $listener,
        ConnectionTraversor $connectionTraversor,
        Executor $executor,
        string $projectRootDir,
        LoggerInterface $logger,
        EventRepository $eventRepository,
        ExportUtils $exportUtils,
        Manager $manager
    ) {
        $listener->disableAcl();
        $this->connectionTraversor = $connectionTraversor;
        $this->executor = $executor;
        $this->projectRootDir = $projectRootDir;
        $this->logger = $logger;
        $this->eventRepository = $eventRepository;
        $this->manager = $manager;

        parent::__construct($exportUtils);
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName('capco:export:events:participants')->setDescription(
            'Create csv file from events participants'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->manager->isActive('export')) {
            return;
        }

        $events = $this->eventRepository->findAllWithRegistration();
        foreach ($events as $event) {
            $fileName = 'participants-' . $event['slug'] . '.csv';
            $this->generateEventParticipantsFile($event, $output);
            $this->executeSnapshot($input, $output, $fileName);

            $this->printMemoryUsage($output);
        }
    }

    private function printMemoryUsage(OutputInterface $output): void
    {
        if (!$output->isVerbose()) {
            return;
        }

        $output->write("\n");
        $output->writeln(
            sprintf(
                'Memory usage (currently) %dKB/ (max) %dKB',
                round(memory_get_usage(true) / 1024),
                memory_get_peak_usage(true) / 1024
            )
        );
    }

    private function generateEventParticipantsFile(array $event, OutputInterface $output)
    {
        $data = $this->executor
            ->execute('internal', [
                'query' => $this->getEventParticipantsGraphQLQuery($event['id']),
                'variables' => []
            ])
            ->toArray();

        if (!isset($data['data'])) {
            $this->logger->error('GraphQL Query Error: ' . $data['errors']);
            $this->logger->info('GraphQL query: ' . json_encode($data));
        }
        $fileName = 'participants-' . $event['slug'] . '.csv';

        $this->writer = WriterFactory::create(Type::CSV);
        $this->writer->openToFile(sprintf('%s/web/export/%s', $this->projectRootDir, $fileName));
        $this->writer->addRow(self::PUBLIC_USER_HEADERS_EVENTS);
        $writer = $this->writer;

        $totalCount = Arr::path($data, 'data.events.totalCount');
        $progress = new ProgressBar($output, $totalCount);

        $this->connectionTraversor->traverse(
            $data,
            'participants',
            function ($edge) use ($writer, $progress) {
                $contributor = $edge['node'];
                if (isset($contributor['id'])) {
                    $writer->addRow([
                        $contributor['email'],
                        $contributor['firstname'],
                        $contributor['lastname'],
                        $edge['registeredAnonymously'] ? 'yes' : 'no'
                    ]);
                } else {
                    $writer->addRow([
                        $contributor['notRegisteredEmail'],
                        $contributor['username'],
                        null,
                        $edge['registeredAnonymously'] ? 'yes' : 'no'
                    ]);
                }
                $progress->advance();
            },
            function ($pageInfo) use ($event) {
                return $this->getEventParticipantsGraphQLQuery(
                    $event['id'],
                    $pageInfo['endCursor']
                );
            }
        );

        $writer->close();
        $progress->finish();
        $output->writeln('The export file "' . $fileName . '" has been created.');
    }

    private function getEventParticipantsGraphQLQuery(
        string $eventId,
        ?string $userCursor = null
    ): string {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }

        $eventId = GlobalId::toGlobalId('Event', $eventId);
        $USER_FRAGMENT = self::USER_FRAGMENT;

        return <<<EOF
        query {
          node(id: "${eventId}") {
            ... on Event {
              participants(first: 50 ${userCursor}) {
                edges {
                  cursor
                  registeredAt
                  registeredAnonymously
                  node { 
                    ... on User {
                        ${USER_FRAGMENT}
                    }
                    ... on NotRegistered {
                      username
                      notRegisteredEmail: email
                    }
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
