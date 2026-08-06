<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260803100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Hub metadata and public consultation project type, and remove legacy Hub API Green storage';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS hub_api_green_configuration');
        $this->addSql('CREATE TABLE hub_metadata (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', step_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', enabled TINYINT(1) NOT NULL DEFAULT 0, aiot_code VARCHAR(255) DEFAULT NULL, folder_number VARCHAR(255) DEFAULT NULL, contact_email VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE UNIQUE INDEX hub_metadata_step_unique ON hub_metadata (step_id)');
        $this->addSql('ALTER TABLE hub_metadata ADD CONSTRAINT FK_HUB_METADATA_STEP FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE CASCADE');
        $this->addSql("INSERT INTO project_type (title, slug, color) SELECT 'project.types.publicConsultation', 'public-consultation', '#337ab7' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM project_type WHERE slug = 'public-consultation')");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE hub_metadata DROP FOREIGN KEY FK_HUB_METADATA_STEP');
        $this->addSql('DROP TABLE hub_metadata');
    }
}
