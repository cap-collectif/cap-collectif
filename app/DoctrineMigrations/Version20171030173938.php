<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20171030173938 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE user_notifications_configuration (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', on_proposal_comment_mail TINYINT(1) DEFAULT \'1\' NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE fos_user ADD notifications_configuration_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE fos_user ADD CONSTRAINT FK_957A6479580B13B7 FOREIGN KEY (notifications_configuration_id) REFERENCES user_notifications_configuration (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957A6479580B13B7 ON fos_user (notifications_configuration_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE fos_user DROP FOREIGN KEY FK_957A6479580B13B7');
        $this->addSql('DROP TABLE user_notifications_configuration');
        $this->addSql('DROP INDEX UNIQ_957A6479580B13B7 ON fos_user');
        $this->addSql('ALTER TABLE fos_user DROP notifications_configuration_id');
    }
}
