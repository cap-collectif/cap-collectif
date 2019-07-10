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
    private static $notUpdatedEvents = [];

    protected function configure()
    {
        $this->setName('capco:migrate:eventAddress-to-jsonAddress')
            ->setDescription('Transform all event address to a jsonAddress.')
            ->addArgument('offset', InputArgument::OPTIONAL)
            ->addArgument('limit', InputArgument::OPTIONAL)
            ->addOption('all', InputArgument::OPTIONAL);
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $offset = $input->hasArgument('offset') ? $input->getArgument('offset') : 0;
        $limit = $input->hasArgument('limit') ? $input->getArgument('limit') : 1000;
        $all = $input->hasOption('all');

        /** @var EventRepository $eventRepository */
        $eventRepository = $this->getContainer()->get(EventRepository::class);

        $totalEvents = $all ? $eventRepository->countAll() : $limit;

        for ($i = 0; $i < $totalEvents; $i += $limit) {
            $events = $eventRepository->getEventsWithAddress($offset, $limit);
            $this->migrate($events, $offset, $limit);
            $offset = $limit;
        }

        if (!empty(static::$notUpdatedEvents)) {
            foreach (static::$notUpdatedEvents as $notUpdatedEvent) {
                $output->writeln(
                    sprintf(
                        'the eventId %s with address %s was not updated. Offset %d, limit %d',
                        $notUpdatedEvent['id'],
                        $notUpdatedEvent['oldAddress'],
                        $notUpdatedEvent['offset'],
                        $notUpdatedEvent['limit']
                    )
                );
            }
        } else {
            $output->writeln('It\'s all right !');
        }

        return 0;
    }

    private function migrate(array $events, $offset, $limit)
    {
        $connection = $this->getContainer()->get(Connection::class);

        /** @var Map $maps */
        $maps = $this->getContainer()->get(Map::class);

        foreach ($events as $event) {
            $zipCode = (string) $event['zipCode'];
            $oldAddress = !empty($event['address'])
                ? ', ' . str_replace(',', ' ', $event['address'])
                : '';
            $oldAddress .= !empty($zipCode) ? ', ' . str_replace(',', '', $zipCode) : '';
            $oldAddress .= !empty($event['city']) ? ', ' . $event['city'] : '';
            $oldAddress .= !empty($event['country']) ? ', ' . $event['country'] : '';
            $newAddressField = !empty($oldAddress) ? $maps->getFormattedAddress($oldAddress) : '';
            if (!empty($newAddressField)) {
                $connection->update(
                    'event',
                    ['address_json' => $newAddressField],
                    ['id' => $event['id']]
                );
            } else {
                static::$notUpdatedEvents[] = [
                    'id' => $event['id'],
                    'oldAddress' => $oldAddress,
                    'offset' => $offset,
                    'limit' => $limit
                ];
            }
        }
    }
}
