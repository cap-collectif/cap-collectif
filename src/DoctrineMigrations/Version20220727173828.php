<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220727173828 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'event.creator';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE event ADD creator_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA761220EA6 FOREIGN KEY (creator_id) REFERENCES fos_user (id)');
        $this->addSql('CREATE INDEX IDX_3BAE0AA761220EA6 ON event (creator_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA761220EA6');
        $this->addSql('DROP INDEX IDX_3BAE0AA761220EA6 ON event');
        $this->addSql('ALTER TABLE event DROP creator_id');
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->executeQuery(
            'UPDATE event set creator_id = author_id WHERE creator_id IS NULL AND author_id IS NOT NULL'
        );
    }
}
