<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150226112740 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->update(
            'menu_item',
            ['link' => 'events'],
            ['link' => 'event', 'is_deletable' => 0]
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        $this->connection->update(
            'menu_item',
            ['link' => 'event'],
            ['link' => 'events', 'is_deletable' => 0]
        );
    }
}
