<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160929115340 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE notifications_configuration (id INT AUTO_INCREMENT NOT NULL, proposalform_id INT NOT NULL, entity VARCHAR(255) NOT NULL, on_create TINYINT(1) DEFAULT NULL, on_update TINYINT(1) DEFAULT NULL, on_delete TINYINT(1) DEFAULT NULL, INDEX IDX_256CBA5D7D31849 (proposalform_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE notifications_configuration ADD CONSTRAINT FK_256CBA5D7D31849 FOREIGN KEY (proposalform_id) REFERENCES proposal_form (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE notifications_configuration');
    }
}
