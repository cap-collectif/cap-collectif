<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260401162605 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add cover_id and step_display_type columns';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql("ALTER TABLE project ADD step_display_type VARCHAR(255) DEFAULT 'numbered_list' NOT NULL");
        $this->addSql('ALTER TABLE step ADD cover_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE step ADD CONSTRAINT FK_43B9FE3C922726E9 FOREIGN KEY (cover_id) REFERENCES media__media (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_43B9FE3C922726E9 ON step (cover_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE project DROP step_display_type');
        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3C922726E9');
        $this->addSql('DROP INDEX IDX_43B9FE3C922726E9 ON step');
        $this->addSql('ALTER TABLE step DROP cover_id');
    }
}
