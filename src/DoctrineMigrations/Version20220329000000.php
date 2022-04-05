<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220329000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'emailingCampaign.project';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE emailing_campaign ADD project_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE emailing_campaign ADD CONSTRAINT FK_6016BF9B166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)'
        );
        $this->addSql('CREATE INDEX IDX_6016BF9B166D1F9C ON emailing_campaign (project_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE emailing_campaign DROP FOREIGN KEY FK_6016BF9B166D1F9C');
        $this->addSql('DROP INDEX IDX_6016BF9B166D1F9C ON emailing_campaign');
        $this->addSql('ALTER TABLE emailing_campaign DROP project_id');
    }
}