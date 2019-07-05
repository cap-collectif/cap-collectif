<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Utils\Map;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190709140530 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
    }

    public function preUp(Schema $schema)
    {
        $events = $this->connection->fetchAll(
            'SELECT id, address, zipCode, country, city FROM event LIMIT 0,1000'
        );
        /** @var Map $maps */
        $maps = $this->container->get(Map::class);

        foreach ($events as $event) {
            $zipCode = (string) $event['zipCode'];
            $newAddressField = !empty($event['address'])
                ? ', ' . str_replace(',', ' ', $event['address'])
                : '';
            $newAddressField .= !empty($zipCode) ? ', ' . str_replace(',', '', $zipCode) : '';
            $newAddressField .= !empty($event['city']) ? ', ' . $event['city'] : '';
            $newAddressField .= !empty($event['country']) ? ', ' . $event['country'] : '';
            $newAddressField = !empty($newAddressField)
                ? $maps->getFormattedAddress($newAddressField)
                : '';
            if (!empty($newAddressField)) {
                $this->connection->update(
                    'event',
                    ['address_json' => $newAddressField],
                    ['id' => $event['id']]
                );
            }
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
    }
}
