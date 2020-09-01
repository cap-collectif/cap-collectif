<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\DTO\GoogleMapsAddress;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20200821105044 extends AbstractMigration
{
    public function getDescription() : string
    {
        return 'replace proposalform.lat and .lng by .mapCenter';
    }

    public function up(Schema $schema) : void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE proposal_form ADD map_center LONGTEXT DEFAULT NULL');
    }

    public function postUp(Schema $schema): void
    {
        $latLng = $this->connection->fetchAll('SELECT id, lat_map, lng_map FROM proposal_form');
        foreach ($latLng as $row) {
            if ($row['lat_map'] && $row['lng_map']) {
                $this->connection->update(
                    'proposal_form',
                    ['map_center' => self::generateJSONFromCoordinates($row['lat_map'], $row['lng_map'])],
                    ['id' => $row['id']]
                );
            }
        }
    }

    private static function generateJSONFromCoordinates(string $lat, string $lng): string
    {
        return json_encode([
            0 => [
                'geometry' => [
                    'location_type' => 'GEOMETRIC_CENTER',
                    'location' => [
                        'lat' => $lat,
                        'lng' => $lng
                    ]
                ]
            ]
        ]);
    }

    public function down(Schema $schema) : void
    {
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE proposal_form DROP map_center');
    }
}
