<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20230421104703 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add emailing_campaign_user table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE emailing_campaign_user (emailing_campaign_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', sent_at DATETIME DEFAULT NULL, INDEX IDX_4E275AFA8E9567 (emailing_campaign_id), INDEX IDX_4E275AFAA76ED395 (user_id), PRIMARY KEY(emailing_campaign_id, user_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE emailing_campaign_user ADD CONSTRAINT FK_4E275AFA8E9567 FOREIGN KEY (emailing_campaign_id) REFERENCES emailing_campaign (id)');
        $this->addSql('ALTER TABLE emailing_campaign_user ADD CONSTRAINT FK_4E275AFAA76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE emailing_campaign_user');
    }
}
