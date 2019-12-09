<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150708111739 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE synthesis_user (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', display_name VARCHAR(255) NOT NULL, unique_identifier VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE synthesis ADD editable TINYINT(1) NOT NULL, ADD deleted_at DATETIME DEFAULT NULL'
        );
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1B727ACA70');
        $this->addSql(
            'ALTER TABLE synthesis_element ADD author_id INT DEFAULT NULL, ADD display_type VARCHAR(255) NOT NULL, ADD votes LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:array)\', ADD linked_data_creation DATETIME DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1BF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1B727ACA70 FOREIGN KEY (parent_id) REFERENCES synthesis_element (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_97652E1BF675F31B ON synthesis_element (author_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE synthesis_user');
        $this->addSql('ALTER TABLE synthesis DROP editable, DROP deleted_at');
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1BF675F31B');
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1B727ACA70');
        $this->addSql('DROP INDEX IDX_97652E1BF675F31B ON synthesis_element');
        $this->addSql(
            'ALTER TABLE synthesis_element DROP author_id, DROP display_type, DROP votes, DROP linked_data_creation'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1B727ACA70 FOREIGN KEY (parent_id) REFERENCES synthesis_element (id) ON DELETE CASCADE'
        );
    }
}
