<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150609150018 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE ext_log_entries (id INT AUTO_INCREMENT NOT NULL, action VARCHAR(8) NOT NULL, logged_at DATETIME NOT NULL, object_id VARCHAR(64) DEFAULT NULL, object_class VARCHAR(255) NOT NULL, version INT NOT NULL, data LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:array)\', username VARCHAR(255) DEFAULT NULL, INDEX log_class_lookup_idx (object_class), INDEX log_date_lookup_idx (logged_at), INDEX log_user_lookup_idx (username), INDEX log_version_lookup_idx (object_id, object_class, version), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE synthesis (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', consultation_step_id INT DEFAULT NULL, enabled TINYINT(1) NOT NULL, source_type VARCHAR(255) NOT NULL, INDEX IDX_593C04B636B1EF7E (consultation_step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE synthesis_division (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', original_element_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_C5A1238072A85DB0 (original_element_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE synthesis_element (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', synthesis_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', original_division_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', parent_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', enabled TINYINT(1) NOT NULL, deleted_at DATETIME DEFAULT NULL, archived TINYINT(1) NOT NULL, title VARCHAR(255) DEFAULT NULL, body LONGTEXT DEFAULT NULL, notation INT DEFAULT NULL, linked_data_class VARCHAR(255) DEFAULT NULL, linked_data_id VARCHAR(255) DEFAULT NULL, INDEX IDX_97652E1BEC91FE48 (synthesis_id), INDEX IDX_97652E1BB68A72A3 (original_division_id), INDEX IDX_97652E1B727ACA70 (parent_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE synthesis ADD CONSTRAINT FK_593C04B636B1EF7E FOREIGN KEY (consultation_step_id) REFERENCES step (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE synthesis_division ADD CONSTRAINT FK_C5A1238072A85DB0 FOREIGN KEY (original_element_id) REFERENCES synthesis_element (id)'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1BEC91FE48 FOREIGN KEY (synthesis_id) REFERENCES synthesis (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1BB68A72A3 FOREIGN KEY (original_division_id) REFERENCES synthesis_division (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1B727ACA70 FOREIGN KEY (parent_id) REFERENCES synthesis_element (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE step ADD synthesis_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3CEC91FE48 FOREIGN KEY (synthesis_id) REFERENCES synthesis (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_43B9FE3CEC91FE48 ON step (synthesis_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3CEC91FE48');
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1BEC91FE48');
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1BB68A72A3');
        $this->addSql('ALTER TABLE synthesis_division DROP FOREIGN KEY FK_C5A1238072A85DB0');
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1B727ACA70');
        $this->addSql('DROP TABLE ext_log_entries');
        $this->addSql('DROP TABLE synthesis');
        $this->addSql('DROP TABLE synthesis_division');
        $this->addSql('DROP TABLE synthesis_element');
        $this->addSql('DROP INDEX IDX_43B9FE3CEC91FE48 ON step');
        $this->addSql('ALTER TABLE step DROP synthesis_id');
    }
}
