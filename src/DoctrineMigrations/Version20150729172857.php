<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150729172857 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE synthesis_division DROP INDEX IDX_C5A1238072A85DB0, ADD UNIQUE INDEX UNIQ_C5A1238072A85DB0 (original_element_id)'
        );
        $this->addSql('ALTER TABLE synthesis_division DROP FOREIGN KEY FK_C5A1238072A85DB0');
        $this->addSql(
            'ALTER TABLE synthesis_division CHANGE original_element_id original_element_id VARCHAR(255) NOT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE synthesis_division ADD CONSTRAINT FK_C5A1238072A85DB0 FOREIGN KEY (original_element_id) REFERENCES synthesis_element (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD division_id VARCHAR(255) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE synthesis_element ADD CONSTRAINT FK_97652E1B41859289 FOREIGN KEY (division_id) REFERENCES synthesis_division (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX UNIQ_97652E1B41859289 ON synthesis_element (division_id)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE synthesis_division DROP INDEX UNIQ_C5A1238072A85DB0, ADD INDEX IDX_C5A1238072A85DB0 (original_element_id)'
        );
        $this->addSql('ALTER TABLE synthesis_division DROP FOREIGN KEY FK_C5A1238072A85DB0');
        $this->addSql(
            'ALTER TABLE synthesis_division CHANGE original_element_id original_element_id VARCHAR(255) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE synthesis_division ADD CONSTRAINT FK_C5A1238072A85DB0 FOREIGN KEY (original_element_id) REFERENCES synthesis_element (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE synthesis_element DROP FOREIGN KEY FK_97652E1B41859289');
        $this->addSql('DROP INDEX UNIQ_97652E1B41859289 ON synthesis_element');
        $this->addSql('ALTER TABLE synthesis_element DROP division_id');
    }
}
