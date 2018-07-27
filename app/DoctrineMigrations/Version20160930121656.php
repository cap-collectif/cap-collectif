<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160930121656 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE notifications_configuration (id INT AUTO_INCREMENT NOT NULL, entity VARCHAR(255) NOT NULL, on_create TINYINT(1) DEFAULT NULL, on_update TINYINT(1) DEFAULT NULL, on_delete TINYINT(1) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE proposal_form ADD notification_configuration_id INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E834F9F76D25 FOREIGN KEY (notification_configuration_id) REFERENCES notifications_configuration (id)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX UNIQ_72E9E834F9F76D25 ON proposal_form (notification_configuration_id)'
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E834F9F76D25');
        $this->addSql('DROP TABLE notifications_configuration');
        $this->addSql('DROP INDEX UNIQ_72E9E834F9F76D25 ON proposal_form');
        $this->addSql('ALTER TABLE proposal_form DROP notification_configuration_id');
    }
}
