<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260702160000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add custom code versioning history';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE custom_code_version (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', restored_from_version_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', created_by_user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', keyname VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, author_name VARCHAR(120) NOT NULL, description LONGTEXT DEFAULT NULL, reference_url VARCHAR(2048) DEFAULT NULL, content LONGTEXT DEFAULT NULL, content_hash VARCHAR(64) NOT NULL, previous_content_hash VARCHAR(64) DEFAULT NULL, type VARCHAR(32) NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_8F11118B71E8C3F3 (restored_from_version_id), INDEX IDX_8F11118BA31E9F89 (created_by_user_id), INDEX custom_code_version_keyname_created_at_idx (keyname, created_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE custom_code_version ADD CONSTRAINT FK_8F11118B71E8C3F3 FOREIGN KEY (restored_from_version_id) REFERENCES custom_code_version (id) ON DELETE SET NULL');
        $this->addSql("
            INSERT INTO custom_code_version (
                id,
                keyname,
                title,
                author_name,
                description,
                reference_url,
                content,
                content_hash,
                previous_content_hash,
                type,
                restored_from_version_id,
                created_by_user_id,
                created_at
            )
            SELECT
                UUID(),
                sp.keyname,
                'Version initiale',
                'System',
                NULL,
                NULL,
                sp.value,
                SHA2(COALESCE(sp.value, ''), 256),
                NULL,
                'INITIAL',
                NULL,
                NULL,
                NOW()
            FROM site_parameter sp
            WHERE sp.keyname IN (
                'homepage.customcode',
                'registration.customcode',
                'event.customcode',
                'blog.customcode',
                'themes.customcode',
                'projects.customcode',
                'members.customcode',
                'contact.customcode',
                'global.site.embed_js'
            )
            AND NOT EXISTS (
                SELECT 1 FROM custom_code_version ccv WHERE ccv.keyname = sp.keyname
            )
        ");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE custom_code_version DROP FOREIGN KEY FK_8F11118B71E8C3F3');
        $this->addSql('DROP TABLE custom_code_version');
    }
}
