<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20161019172405 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472A52AB36 FOREIGN KEY (proposal_form_id) REFERENCES proposal_form (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE step ADD timeless TINYINT(1) DEFAULT \'0\'');
        $this->addSql('UPDATE step SET timeless = 0');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472F675F31B');
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472A52AB36');
        $this->addSql('ALTER TABLE step DROP timeless');
    }
}
