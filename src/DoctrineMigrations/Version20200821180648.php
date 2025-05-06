<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20200821180648 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'remove latMap and lngMap';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal_form DROP lat_map, DROP lng_map');
    }

    public function postDown(Schema $schema): void
    {
        $forms = $this->connection->fetchAllAssociative('SELECT id, map_center FROM proposal_form');
        foreach ($forms as $row) {
            if ($row['map_center']) {
                $coordinates = self::getCoordinatesFromJson($row['map_center']);
                $this->connection->update(
                    'proposal_form',
                    [
                        'lat_map' => $coordinates['lat'],
                        'lng_map' => $coordinates['lng'],
                    ],
                    ['id' => $row['id']]
                );
            }
        }
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE proposal_form ADD lat_map DOUBLE PRECISION DEFAULT NULL, ADD lng_map DOUBLE PRECISION DEFAULT NULL'
        );
    }

    private static function getCoordinatesFromJson(string $json): array
    {
        return json_decode($json, true)[0]['geometry']['location'];
    }
}
