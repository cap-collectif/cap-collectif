<?php

namespace Capco\AppBundle\Command\Migrations;

use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Utils\Map;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class MigrateEventAddressesToJsonAddressesCommand extends ContainerAwareCommand
{
    private $connection;
    protected static $defaultName = 'capco:migrate:eventAddress-to-jsonAddress';

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
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
        $offset = $input->getArgument('offset') ? $input->getArgument('offset') : 0;
        $limit = $input->getArgument('limit') ? $input->getArgument('limit') : 1000;
        $all = $input->getOption('all');
        /** @var EventRepository $eventRepository */
        $eventRepository = $this->getContainer()->get(EventRepository::class);

        $totalEvents = $all ? $eventRepository->countAllWithoutJsonAddress() : $limit;

        for ($i = 0; $i < $totalEvents; $i += $limit) {
            $events = $eventRepository->getEventsWithAddress($offset, $limit);
            $this->migrate($events, $offset, $limit, $output);
            $offset = $limit;
        }

        return 0;
    }

    private function migrate(array $events, $offset, $limit, OutputInterface $output): void
    {
        /** @var Map $maps */
        $maps = $this->getContainer()->get(Map::class);

        foreach ($events as $event) {
            $zipCode = (string)$event['zipCode'];
            $oldAddress = !empty($event['address'])
                ? ', '.str_replace(',', ' ', $event['address'])
                : '';
            $oldAddress .= !empty($zipCode) ? ', '.str_replace(',', '', $zipCode) : '';
            $oldAddress .= !empty($event['city']) ? ', '.$event['city'] : '';
            $oldAddress .= !empty($event['country']) ? ', '.$event['country'] : '';
            $oldAddress = trim(trim($oldAddress, ','));
            $newAddressField = !empty($oldAddress) ? $maps->getFormattedAddress($oldAddress) : '';

            $this->checkLevenshteinAddressDiff($oldAddress, $newAddressField, $output, $event);

            if (!empty($newAddressField)) {
                $this->connection->update(
                    'event',
                    ['address_json' => $newAddressField],
                    ['id' => $event['id']]
                );
            } else {
                $output->writeln(
                    sprintf(
                        '<error>the eventId %s with address "%s" was not updated. Offset %d, limit %d</error>',
                        $event['id'],
                        $oldAddress,
                        $offset,
                        $limit
                    )
                );
            }
        }
    }

    private function checkLevenshteinAddressDiff($oldAddress, $jsonAddress, OutputInterface $output, array $event)
    {
        $newAddress = $this->getFullAddressFromJson($jsonAddress);
        $newLat = $this->getLatFromJson($jsonAddress);
        $newLng = $this->getLngFromJson($jsonAddress);

        if ($oldAddress && $newAddress && levenshtein($oldAddress, $newAddress) > 9) {
            $output->writeln(
                sprintf(
                    '<warning>the eventId %s with address "%s" got a difference with new address %s</warning>',
                    $event['id'],
                    $oldAddress,
                    $newAddress
                )
            );
        }

        if($event['lng'] && $newLng && levenshtein($event['lng'], $newLng) > 1){
            $output->writeln(
                sprintf(
                    '<warning>the eventId %s with lng "%s" got a difference with new lng %s</warning>',
                    $event['id'],
                    $event['lng'],
                    $newLng
                )
            );
        }
        if($event['lat'] && $newLat && levenshtein($event['lat'], $newLat) > 1){
            $output->writeln(
                sprintf(
                    '<warning>the eventId %s with lng "%s" got a difference with new lng %s</warning>',
                    $event['id'],
                    $event['lat'],
                    $newLat
                )
            );
        }
    }

    private function getFullAddressFromJson($jsonAddress)
    {
        return $jsonAddress ? json_decode($jsonAddress, true)[0]['formatted_address'] : null;
    }

    private function getLatFromJson($jsonAddress)
    {
        if ($jsonAddress) {
            return json_decode($jsonAddress, true)[0]['geometry']['location']['lat'];
        }

        return null;
    }

    private function getLngFromJson($jsonAddress)
    {
        if ($jsonAddress) {
            return json_decode($jsonAddress, true)[0]['geometry']['location']['lng'];
        }

        return null;
    }
}
