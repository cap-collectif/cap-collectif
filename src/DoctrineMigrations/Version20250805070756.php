<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250805070756 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Adds a many to one relation between user_type and media';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_type ADD media_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE user_type ADD CONSTRAINT FK_F65F1BE0EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_F65F1BE0EA9FDD75 ON user_type (media_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_type DROP FOREIGN KEY FK_F65F1BE0EA9FDD75');
        $this->addSql('DROP INDEX IDX_F65F1BE0EA9FDD75 ON user_type');
        $this->addSql('ALTER TABLE user_type DROP media_id');
    }
}
