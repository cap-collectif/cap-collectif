<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220727184600 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'emailing_campaign.creator';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE emailing_campaign ADD creator_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE emailing_campaign ADD CONSTRAINT FK_6016BF9B61220EA6 FOREIGN KEY (creator_id) REFERENCES fos_user (id)');
        $this->addSql('CREATE INDEX IDX_6016BF9B61220EA6 ON emailing_campaign (creator_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE emailing_campaign DROP FOREIGN KEY FK_6016BF9B61220EA6');
        $this->addSql('DROP INDEX IDX_6016BF9B61220EA6 ON emailing_campaign');
        $this->addSql('ALTER TABLE emailing_campaign DROP creator_id');
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->executeQuery(
            'UPDATE emailing_campaign set creator_id = owner_id WHERE creator_id IS NULL AND owner_id IS NOT NULL'
        );
    }
}
