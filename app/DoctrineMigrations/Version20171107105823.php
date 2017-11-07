<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20171107105823 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE user_notifications_configuration DROP FOREIGN KEY FK_AAEA4B03A76ED395');
        $this->addSql('DROP INDEX UNIQ_AAEA4B03A76ED395 ON user_notifications_configuration');
        $this->addSql('ALTER TABLE user_notifications_configuration DROP user_id');
        $this->addSql('ALTER TABLE fos_user DROP FOREIGN KEY FK_957A6479580B13B7');
        $this->addSql('ALTER TABLE fos_user ADD CONSTRAINT FK_957A6479580B13B7 FOREIGN KEY (notifications_configuration_id) REFERENCES user_notifications_configuration (id) ON DELETE CASCADE');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE fos_user DROP FOREIGN KEY FK_957A6479580B13B7');
        $this->addSql('ALTER TABLE fos_user ADD CONSTRAINT FK_957A6479580B13B7 FOREIGN KEY (notifications_configuration_id) REFERENCES user_notifications_configuration (id)');
        $this->addSql('ALTER TABLE user_notifications_configuration ADD user_id CHAR(36) DEFAULT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE user_notifications_configuration ADD CONSTRAINT FK_AAEA4B03A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_AAEA4B03A76ED395 ON user_notifications_configuration (user_id)');
    }
}
