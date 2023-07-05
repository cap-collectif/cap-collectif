<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\DTO\GoogleMapsAddress;
use Capco\AppBundle\EventListener\GraphQlAclListener;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Capco\AppBundle\Utils\Arr;
use Overblog\GraphQLBundle\Request\Executor;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class CreateCsvFromEventsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

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
        'custom_code',
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
        ExportUtils $exportUtils,
        Manager $manager
    ) {
        parent::__construct($exportUtils);
        $listener->disableAcl();
        $this->connectionTraversor = $connectionTraversor;
        $this->executor = $executor;
        $this->projectRootDir = $projectRootDir;
        $this->logger = $logger;
        $this->manager = $manager;
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName('capco:export:events')->setDescription('Create csv file from event data');
        $this->addOption(
            'delimiter',
            'd',
            InputOption::VALUE_OPTIONAL,
            'Delimiter used in csv',
            ';'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->manager->isActive('export')) {
            return 1;
        }
        $fileName = 'events.csv';

        $data = $this->executor
            ->execute('internal', [
                'query' => $this->getEventsGraphQLQuery(),
                'variables' => [],
            ])
            ->toArray()
        ;

        if (!isset($data['data'])) {
            $this->logger->error('GraphQL Query Error: ' . $data['error']);
            $this->logger->info('GraphQL query: ' . json_encode($data));
        }
        $this->writer = WriterFactory::create(Type::CSV, $input->getOption('delimiter'));
        $this->writer->openToFile(sprintf('%s/public/export/%s', $this->projectRootDir, $fileName));
        $this->writer->addRow(WriterEntityFactory::createRowFromArray(self::EVENTS_HEADERS));
        $writer = $this->writer;

        $totalCount = Arr::path($data, 'data.events.totalCount');
        $progress = new ProgressBar($output, (int) $totalCount);

        $this->connectionTraversor->traverse(
            $data,
            'events',
            function ($edge) use ($writer, $progress) {
                $event = $edge['node'];
                $this->handleAddressFormat($event);
                $writer->addRow(
                    WriterEntityFactory::createRowFromArray([
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
                        $event['customCode'],
                    ])
                );
                $progress->advance();
            },
            function ($pageInfo) {
                return $this->getEventsGraphQLQuery($pageInfo['endCursor']);
            }
        );
        $writer->close();

        $progress->finish();
        $output->writeln('The export file "' . $fileName . '" has been created.');

        $this->executeSnapshot($input, $output, $fileName);

        return 0;
    }

    private function getEventsGraphQLQuery(?string $userCursor = null): string
    {
        if ($userCursor) {
            $userCursor = sprintf(', after: "%s"', $userCursor);
        }

        return <<<EOF
                    {
                      events(first: 100 {$userCursor}) {
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
                            googleMapsAddress {
                              json
                            }
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

    private function handleAddressFormat(array &$event): void
    {
        $googleMapsAddress = null;
        if ($event['googleMapsAddress']) {
            $googleMapsAddress = GoogleMapsAddress::fromApi($event['googleMapsAddress']['json']);
        }

        if (null === $googleMapsAddress) {
            return;
        }

        $this->mapGoogleMapAddressOnEvent($event, $googleMapsAddress);
    }

    private function mapGoogleMapAddressOnEvent(array &$event, GoogleMapsAddress $address): void
    {
        $decomposed = $address->decompose();
        $poi = $decomposed['point_of_interest'] ?? null;
        $route = $decomposed['route'] ?? null;
        $streetNumber = $decomposed['street_number'] ?? null;

        if ($poi || $route) {
            $event['address'] = '';
            if ($poi) {
                $event['address'] = $poi;
            }
            if ($poi && $route) {
                $event['address'] .= ', ';
            }
            if ($route) {
                if ($streetNumber) {
                    $event['address'] .= $streetNumber . ' ';
                }
                $event['address'] .= $route;
            }
        }
        if (\array_key_exists('postal_code', $decomposed)) {
            $event['zipCode'] = $decomposed['postal_code'];
        }
        if (\array_key_exists('locality', $decomposed)) {
            $event['city'] = $decomposed['locality'];
        }
        if (\array_key_exists('country', $decomposed)) {
            $event['country'] = $decomposed['country'];
        }
    }
}
