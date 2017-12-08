<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20171207153621 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE site_image ADD is_social_network_thumbnail TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE site_parameter ADD is_social_network_description TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE project ADD meta_description VARCHAR(160) DEFAULT NULL');
        $this->addSql('ALTER TABLE theme ADD meta_description VARCHAR(160) DEFAULT NULL');
        $this->addSql('ALTER TABLE step ADD meta_description VARCHAR(160) DEFAULT NULL');
        $this->addSql('ALTER TABLE page ADD meta_description VARCHAR(160) DEFAULT NULL');
        $this->addSql('ALTER TABLE event ADD meta_description VARCHAR(160) DEFAULT NULL');
        $this->addSql('ALTER TABLE blog_post ADD meta_description VARCHAR(160) DEFAULT NULL');

        $this->addSql('ALTER TABLE page ADD cover_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE page ADD CONSTRAINT FK_140AB620922726E9 FOREIGN KEY (cover_id) REFERENCES media__media (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_140AB620922726E9 ON page (cover_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE site_image DROP is_social_network_thumbnail');
        $this->addSql('ALTER TABLE site_parameter DROP is_social_network_description');
        $this->addSql('ALTER TABLE blog_post DROP meta_description');
        $this->addSql('ALTER TABLE event DROP meta_description');
        $this->addSql('ALTER TABLE page DROP meta_description');
        $this->addSql('ALTER TABLE step DROP meta_description');
        $this->addSql('ALTER TABLE theme DROP meta_description');
        $this->addSql('ALTER TABLE project DROP meta_description');

        $this->addSql('ALTER TABLE page DROP FOREIGN KEY FK_140AB620922726E9');
        $this->addSql('DROP INDEX IDX_140AB620922726E9 ON page');
        $this->addSql('ALTER TABLE page DROP cover_id');
    }
}
