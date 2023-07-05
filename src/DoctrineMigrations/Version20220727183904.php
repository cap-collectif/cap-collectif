<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220727183904 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'mailing_list.creator';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE mailing_list ADD creator_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE mailing_list ADD CONSTRAINT FK_15C473AF61220EA6 FOREIGN KEY (creator_id) REFERENCES fos_user (id)');
        $this->addSql('CREATE INDEX IDX_15C473AF61220EA6 ON mailing_list (creator_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE mailing_list DROP FOREIGN KEY FK_15C473AF61220EA6');
        $this->addSql('DROP INDEX IDX_15C473AF61220EA6 ON mailing_list');
        $this->addSql('ALTER TABLE mailing_list DROP creator_id');
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->executeQuery(
            'UPDATE mailing_list set creator_id = owner_id WHERE creator_id IS NULL AND owner_id IS NOT NULL'
        );
    }
}
