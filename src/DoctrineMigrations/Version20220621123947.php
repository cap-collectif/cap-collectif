<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220621123947 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Organization';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'CREATE TABLE organization (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', logo_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', banner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', body LONGTEXT DEFAULT NULL, slug VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_C1EE637CF98F144A (logo_id), UNIQUE INDEX UNIQ_C1EE637C684EC833 (banner_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE organization_member (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', organization_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', user_id CHAR(36)  NOT NULL COMMENT \'(DC2Type:guid)\', role ENUM(\'admin\', \'user\') COMMENT \'(DC2Type:enum_organization_member_role_type)\' DEFAULT \'user\' NOT NULL COMMENT \'(DC2Type:enum_organization_member_role_type)\', created_at DATETIME NOT NULL, INDEX IDX_756A2A8D32C8A3DE (organization_id), INDEX IDX_756A2A8DA76ED395 (user_id), UNIQUE INDEX member_unique_organization (user_id, organization_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE organization_social_networks (organization_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', web_page_url VARCHAR(255) DEFAULT NULL, facebook_url VARCHAR(255) DEFAULT NULL, twitter_url VARCHAR(255) DEFAULT NULL, instagram_url VARCHAR(255) DEFAULT NULL, linked_in_url VARCHAR(255) DEFAULT NULL, youtube_url VARCHAR(255) DEFAULT NULL, PRIMARY KEY(organization_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE organization ADD CONSTRAINT FK_C1EE637CF98F144A FOREIGN KEY (logo_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE organization ADD CONSTRAINT FK_C1EE637C684EC833 FOREIGN KEY (banner_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE organization_member ADD CONSTRAINT FK_756A2A8D32C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE organization_member ADD CONSTRAINT FK_756A2A8DA76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)  ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE organization_social_networks ADD CONSTRAINT FK_510D0D232C8A3DE FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE organization_member DROP FOREIGN KEY FK_756A2A8D32C8A3DE');
        $this->addSql(
            'ALTER TABLE organization_social_networks DROP FOREIGN KEY FK_510D0D232C8A3DE'
        );
        $this->addSql('DROP TABLE organization');
        $this->addSql('DROP TABLE organization_member');
        $this->addSql('DROP TABLE organization_social_networks');
    }
}
