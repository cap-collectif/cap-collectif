<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261012130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create vocal contribution storage without collect step association';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE vocal_contribution (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', participant_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', media_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', completion_status VARCHAR(255) DEFAULT \'COMPLETED\' NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX uniq_vocal_media (media_id), INDEX idx_vocal_status_created (completion_status, created_at), INDEX idx_vocal_user (user_id), INDEX idx_vocal_participant (participant_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE vocal_contribution ADD CONSTRAINT FK_VOCAL_USER FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE vocal_contribution ADD CONSTRAINT FK_VOCAL_PARTICIPANT FOREIGN KEY (participant_id) REFERENCES participant (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE vocal_contribution ADD CONSTRAINT FK_VOCAL_MEDIA FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE RESTRICT');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE vocal_contribution');
    }
}
