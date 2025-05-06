<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20211025114450 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'emailing_campaign.owner_id and mailing_list.owner_id';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE emailing_campaign ADD owner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE emailing_campaign ADD CONSTRAINT FK_6016BF9B7E3C61F9 FOREIGN KEY (owner_id) REFERENCES fos_user (id)'
        );
        $this->addSql('CREATE INDEX IDX_6016BF9B7E3C61F9 ON emailing_campaign (owner_id)');
        $this->addSql(
            'ALTER TABLE mailing_list ADD owner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE mailing_list ADD CONSTRAINT FK_15C473AF7E3C61F9 FOREIGN KEY (owner_id) REFERENCES fos_user (id)'
        );
        $this->addSql('CREATE INDEX IDX_15C473AF7E3C61F9 ON mailing_list (owner_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE emailing_campaign DROP FOREIGN KEY FK_6016BF9B7E3C61F9');
        $this->addSql('DROP INDEX IDX_6016BF9B7E3C61F9 ON emailing_campaign');
        $this->addSql('ALTER TABLE emailing_campaign DROP owner_id');
        $this->addSql('ALTER TABLE mailing_list DROP FOREIGN KEY FK_15C473AF7E3C61F9');
        $this->addSql('DROP INDEX IDX_15C473AF7E3C61F9 ON mailing_list');
        $this->addSql('ALTER TABLE mailing_list DROP owner_id');
    }
}
