<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151112142934 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472AA334807');
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472AA334807 FOREIGN KEY (answer_id) REFERENCES answer (id)'
        );
        $this->addSql('ALTER TABLE question DROP FOREIGN KEY FK_B6F7494EA52AB36');
        $this->addSql(
            'ALTER TABLE question ADD CONSTRAINT FK_B6F7494EA52AB36 FOREIGN KEY (proposal_form_id) REFERENCES proposal_form (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472AA334807');
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472AA334807 FOREIGN KEY (answer_id) REFERENCES answer (id) ON DELETE SET NULL'
        );
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->executeQuery(
            '
          DELETE s.*
          FROM step s
          WHERE NOT EXISTS
          (
            SELECT NULL
            FROM project_abstractstep pas
            WHERE pas.step_id = s.id
          )
        '
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472AA334807');
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472AA334807 FOREIGN KEY (answer_id) REFERENCES answer (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE question DROP FOREIGN KEY FK_B6F7494EA52AB36');
        $this->addSql(
            'ALTER TABLE question ADD CONSTRAINT FK_B6F7494EA52AB36 FOREIGN KEY (proposal_form_id) REFERENCES proposal_form (id)'
        );
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472AA334807');
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472AA334807 FOREIGN KEY (answer_id) REFERENCES answer (id)'
        );
    }
}
