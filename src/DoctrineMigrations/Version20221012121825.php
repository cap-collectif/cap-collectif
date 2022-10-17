<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20221012121825 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add organization_id to blog_post_authors';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blog_post_authors DROP PRIMARY KEY');
        $this->addSql(
            'ALTER TABLE blog_post_authors ADD id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', ADD organization_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE user_id user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE blog_post_authors ADD CONSTRAINT FK_E93872E532C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_E93872E532C8A3DE ON blog_post_authors (organization_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blog_post_authors DROP FOREIGN KEY FK_E93872E532C8A3DE');
        $this->addSql('DROP INDEX IDX_E93872E532C8A3DE ON blog_post_authors');
        $this->addSql(
            'ALTER TABLE blog_post_authors DROP id, DROP organization_id, CHANGE user_id user_id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql('ALTER TABLE blog_post_authors ADD PRIMARY KEY (post_id, user_id)');
    }
}
