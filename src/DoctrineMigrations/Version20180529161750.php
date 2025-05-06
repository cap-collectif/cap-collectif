<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180529161750 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');

        $this->connection->insert('site_color', [
            'keyname' => 'color.bg.primary',
            'category' => 'settings.appearance',
            'created_at' => $date,
            'updated_at' => $date,
            'is_enabled' => 1,
            'value' => '#e3e3e3',
            'position' => 34,
        ]);
    }

    public function postDown(Schema $schema): void
    {
        $this->connection->delete('site_color', ['keyname' => 'color.bg.primary']);
    }
}
