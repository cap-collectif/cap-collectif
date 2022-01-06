<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211229132828 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'emailing_campaign.add_emailing_group';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE emailing_campaign ADD emailing_group CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE emailing_campaign ADD CONSTRAINT FK_6016BF9BEE25B060 FOREIGN KEY (emailing_group) REFERENCES user_group (id)'
        );
        $this->addSql('CREATE INDEX IDX_6016BF9BEE25B060 ON emailing_campaign (emailing_group)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE emailing_campaign DROP FOREIGN KEY FK_6016BF9BEE25B060');
        $this->addSql('DROP INDEX IDX_6016BF9BEE25B060 ON emailing_campaign');
        $this->addSql('ALTER TABLE emailing_campaign DROP emailing_group');
    }
}
