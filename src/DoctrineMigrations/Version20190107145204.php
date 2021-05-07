<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190107145204 extends AbstractMigration
{
    public function postUp(Schema $schema): void
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');

        if (
            !$this->connection->fetchAssoc(
                "SELECT id FROM site_image WHERE site_image.keyname = 'favicon'"
            )
        ) {
            $this->connection->insert('site_image', [
                'keyname' => 'favicon',
                'category' => 'global',
                'is_enabled' => 1,
                'position' => 1,
                'created_at' => $date,
                'updated_at' => $date,
                'is_social_network_thumbnail' => 0
            ]);
        }
    }

    public function postDown(Schema $schema): void
    {
        if (
            $this->connection->fetchAssoc(
                "SELECT id FROM site_image WHERE site_image.keyname = 'favicon'"
            )
        ) {
            $this->connection->delete('site_image', [
                'keyname' => 'favicon',
            ]);
        }
    }

    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }
}
