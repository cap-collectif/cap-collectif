<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220623112918 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'table.pending_organization_invitation       ';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'CREATE TABLE pending_organization_invitation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', organization_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', creator_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', email VARCHAR(255) DEFAULT NULL, token VARCHAR(255) NOT NULL, role ENUM(\'admin\', \'user\') COMMENT \'(DC2Type:enum_organization_member_role_type)\' DEFAULT \'user\' NOT NULL COMMENT \'(DC2Type:enum_organization_member_role_type)\', created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_FF49A47BA76ED395 (user_id), INDEX IDX_FF49A47B32C8A3DE (organization_id), INDEX IDX_FF49A47B61220EA6 (creator_id), UNIQUE INDEX token_unique (token), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE pending_organization_invitation ADD CONSTRAINT FK_FF49A47BA76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE pending_organization_invitation ADD CONSTRAINT FK_FF49A47B32C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id)'
        );
        $this->addSql(
            'ALTER TABLE pending_organization_invitation ADD CONSTRAINT FK_FF49A47B61220EA6 FOREIGN KEY (creator_id) REFERENCES fos_user (id)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE pending_organization_invitation');
    }
}
