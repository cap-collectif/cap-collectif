<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150901110453 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->connection->executeQuery('UPDATE opinion_type SET vote_widget_type = ?', [2]);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
