<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160211000145 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->connection->update('menu_item', ['link' => 'projects'], ['link' => 'consultations']);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
