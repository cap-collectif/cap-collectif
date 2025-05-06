<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210824082430 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add owner_id to event';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE event ADD owner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA77E3C61F9 FOREIGN KEY (owner_id) REFERENCES fos_user (id)'
        );
        $this->addSql('CREATE INDEX IDX_3BAE0AA77E3C61F9 ON event (owner_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE event DROP FOREIGN KEY FK_3BAE0AA77E3C61F9');
        $this->addSql('DROP INDEX IDX_3BAE0AA77E3C61F9 ON event');
        $this->addSql('ALTER TABLE event DROP owner_id');
    }
}
