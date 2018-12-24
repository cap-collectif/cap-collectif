<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181224142858 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        if (
            !$this->connection->fetchAssoc(
                "SELECT * FROM site_image WHERE site_image.keyname = 'favicon'"
            )
        ) {
            $this->connection->insert('site_image', [
                'keyname' => 'favicon',
                'category' => 'global',
                'is_enabled' => true,
                'position' => 1,
            ]);
        }
    }

    public function down(Schema $schema): void
    {
        if (
            $this->connection->fetchAssoc(
                "SELECT * FROM site_image WHERE site_image.keyname = 'favicon'"
            )
        ) {
            $this->connection->delete('site_image', [
                'keyname' => 'favicon',
            ]);
        }
    }
}
