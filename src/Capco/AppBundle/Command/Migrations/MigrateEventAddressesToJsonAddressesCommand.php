<?php

namespace Capco\AppBundle\Command\Migrations;

use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Utils\Map;
use Doctrine\DBAL\Connection;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class MigrateEventAddressesToJsonAddressesCommand extends Command
{
    protected static $defaultName = 'capco:migrate:eventAddress-to-jsonAddress';
    private $connection;
    private $map;
    private $eventRepository;

    public function __construct(Connection $connection, Map $map, EventRepository $eventRepository)
    {
        $this->connection = $connection;
        $this->map = $map;
        $this->eventRepository = $eventRepository;
        parent::__construct();
    }

    protected function configure()
    {
        $this->setName('capco:migrate:eventAddress-to-jsonAddress')
            ->setDescription('Transform all event address to a jsonAddress.')
            ->addArgument('offset', InputArgument::OPTIONAL, 'use this to set the offset')
            ->addArgument('limit', InputArgument::OPTIONAL, 'use this to set the limit')
            ->addOption(
                'all',
                null,
                InputArgument::OPTIONAL,
                'use this if you want to migrate all address',
                false
            );
        $this->setHelp(
            'To receive output in file use the native linux syntax as bin/console y:command > output.txt'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $offset = $input->getArgument('offset') ?: 0;
        $limit = $input->getArgument('limit') ?: 1000;
        $all = $input->getOption('all');
        $offset = $all ? 0 : $offset;

        $totalEvents = $all ? $this->eventRepository->countAllWithoutJsonAddress() : $limit;

        for ($i = 0; $i < $totalEvents; $i += $limit) {
            $events = $this->eventRepository->getEventsWithAddress($offset, $limit);
            $this->migrate($events, $output);
            $offset = $limit;
        }

        return 0;
    }

    private function migrate(array $events, OutputInterface $output): void
    {
        foreach ($events as $event) {
            $jsonAddress =
                !empty($event['lng']) && !empty($event['lat'])
                    ? $this->map->reverserGeocodingAddress($event['lat'], $event['lng'])
                    : '';
            $similarity = $this->checkSimilarityAddressDiff($jsonAddress, $output, $event);

            if (!empty($jsonAddress) && $similarity) {
                $this->connection->update(
                    'event',
                    [
                        'address_json' => $jsonAddress,
                        'similarity_of_new_address' =>
                            ($similarity['percLat'] + $similarity['percLng']) / 2,
                        'new_address_is_similar' => $similarity['newAddressIsSimilar']
                    ],
                    ['id' => $event['id']]
                );
            }
        }
    }

    private function checkSimilarityAddressDiff($jsonAddress, OutputInterface $output, array $event)
    {
        $newLat = $this->getLatFromJson($jsonAddress);
        $newLng = $this->getLngFromJson($jsonAddress);

        if ($event['lng'] && $newLng && $event['lat'] && $newLat) {
            similar_text($event['lng'], $newLng, $percLng);
            similar_text($event['lng'], $newLng, $percLat);
            $similarity = ['percLat' => round($percLat, 2), 'percLng' => round($percLng, 2)];
            $similarity['newAddressIsSimilar'] = true;

            if ($percLng < 75) {
                $similarity['newAddressIsSimilar'] = false;
                $output->writeln(
                    sprintf(
                        '<comment>the eventId %s with lng "%s" is only %s similar with new lng %s</comment>',
                        $event['id'],
                        $event['lng'],
                        round($percLng, 2) . '%',
                        $newLng
                    )
                );
            }
            if ($percLat < 75) {
                $similarity['newAddressIsSimilar'] = false;
                $output->writeln(
                    sprintf(
                        '<comment>the eventId %s with lat "%s" is only %s similar with new lat %s</comment>',
                        $event['id'],
                        $event['lat'],
                        round($percLat, 2) . '%',
                        $newLat
                    )
                );
            }

            return $similarity;
        }
    }

    private function getLatFromJson($jsonAddress): ?string
    {
        if ($jsonAddress) {
            return json_decode($jsonAddress, true)[0]['geometry']['location']['lat'];
        }

        return null;
    }

    private function getLngFromJson($jsonAddress): ?string
    {
        if ($jsonAddress) {
            return json_decode($jsonAddress, true)[0]['geometry']['location']['lng'];
        }

        return null;
    }
}
