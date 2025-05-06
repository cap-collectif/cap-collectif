<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220727181450 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'questionnaire.creator';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE questionnaire ADD creator_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE questionnaire ADD CONSTRAINT FK_7A64DAF61220EA6 FOREIGN KEY (creator_id) REFERENCES fos_user (id)');
        $this->addSql('CREATE INDEX IDX_7A64DAF61220EA6 ON questionnaire (creator_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE questionnaire DROP FOREIGN KEY FK_7A64DAF61220EA6');
        $this->addSql('DROP INDEX IDX_7A64DAF61220EA6 ON questionnaire');
        $this->addSql('ALTER TABLE questionnaire DROP creator_id');
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->executeQuery(
            'UPDATE questionnaire set creator_id = owner_id WHERE creator_id IS NULL AND owner_id IS NOT NULL'
        );
    }
}
