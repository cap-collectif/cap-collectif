<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Utils\Arr;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromEventsCommand extends Command
{
    public const EVENTS_HEADERS = [
        '_id',
        'id',
        'title',
        'body',
        'media_id',
        'media_url',
        'author_id',
        'author_email',
        'created_at',
        'updated_at',
        'is_enabled',
        'start_at',
        'end_at',
        'zipCode',
        'address',
        'city',
        'country',
        'lat',
        'lng',
        'link',
        'registration_enabled',
        'comments_count',
        'is_commentable',
        'meta_description',
        'custom_code'
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
    protected $manager;

    public function __construct(
        GraphQlAclListener $listener,
        ConnectionTraversor $connectionTraversor,
        Executor $executor,
        string $projectRootDir,
        LoggerInterface $logger,
        Manager $manager
    ) {
        $listener->disableAcl();
        $this->connectionTraversor = $connectionTraversor;
        $this->executor = $executor;
        $this->projectRootDir = $projectRootDir;
        $this->logger = $logger;
        $this->manager = $manager;
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setName('capco:export:events')->setDescription('Create csv file from event data');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->manager->isActive('export')) {
            return;
        }
        $fileName = 'events.csv';

        $data = $this->executor
            ->execute('internal', [
                'query' => $this->getEventsGraphQLQuery(),
                'variables' => []
            ])
            ->toArray();

        if (!isset($data['data'])) {
            $this->logger->error('GraphQL Query Error: ' . $data['error']);
            $this->logger->info('GraphQL query: ' . json_encode($data));
        }
        $delimiter = $input->getOption('delimiter');
        $this->writer = WriterFactory::create(Type::CSV, $delimiter);
        $this->writer->openToFile(sprintf('%s/web/export/%s', $this->projectRootDir, $fileName));
        $this->writer->addRow(self::EVENTS_HEADERS);
        $writer = $this->writer;

        $totalCount = Arr::path($data, 'data.events.totalCount');
        $progress = new ProgressBar($output, $totalCount);

        $this->connectionTraversor->traverse(
            $data,
            'events',
            function ($edge) use ($writer, $progress) {
                $event = $edge['node'];
                $writer->addRow([
                    $event['_id'],
                    $event['id'],
                    $event['title'],
                    $event['body'],
                    $event['media'] ? $event['media']['id'] : null,
                    $event['media'] ? $event['media']['url'] : null,
                    $event['author'] ? $event['author']['id'] : null,
                    $event['author'] ? $event['author']['email'] : null,
                    $event['createdAt'],
                    $event['updatedAt'],
                    $event['enabled'],
                    $event['startAt'],
                    $event['endAt'],
                    $event['zipCode'],
                    $event['address'],
                    $event['city'],
                    $event['country'],
                    $event['lat'],
                    $event['lng'],
                    $event['link'],
                    $event['guestListEnabled'],
                    $event['comments'] ? $event['comments']['totalCount'] : null,
                    $event['commentable'],
                    $event['metaDescription'],
                    $event['customCode']
                ]);
                $progress->advance();
            },
            function ($pageInfo) {
                return $this->getEventsGraphQLQuery($pageInfo['endCursor']);
            }
        );
        $writer->close();

        $progress->finish();
        $output->writeln('The export file "' . $fileName . '" has been created.');
    }

    private function getEventsGraphQLQuery(?string $userCursor = null): string
    {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }

        return <<<EOF
        {
          events(first: 100 ${userCursor}) {
            totalCount
            pageInfo {
              startCursor
              endCursor
              hasNextPage
            }
            edges {
              cursor  
              node {
                _id
                id
                title
                body
                media {
                  id
                  url
                }
                author {
                  id
                  email
                }
                createdAt
                updatedAt
                enabled
                startAt
                endAt
                zipCode
                address
                city
                country
                lat
                lng
                link
                guestListEnabled
                comments {
                  totalCount
                }
                commentable
                metaDescription
                customCode
              }
            }
          }
        }
EOF;
    }
}
