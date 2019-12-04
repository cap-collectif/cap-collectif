<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171013183834 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(
            'CREATE TABLE proposal_evaluation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_61119603F4792058 (proposal_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE proposal_evaluation ADD CONSTRAINT FK_61119603F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql('ALTER TABLE proposal_form ADD evaluation_form_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E8347CE583F7 FOREIGN KEY (evaluation_form_id) REFERENCES questionnaire (id)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX UNIQ_72E9E8347CE583F7 ON proposal_form (evaluation_form_id)'
        );
        $this->addSql(
            'ALTER TABLE response ADD evaluation_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE response ADD CONSTRAINT FK_3E7B0BFB456C5646 FOREIGN KEY (evaluation_id) REFERENCES proposal_evaluation (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_3E7B0BFB456C5646 ON response (evaluation_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE response DROP FOREIGN KEY FK_3E7B0BFB456C5646');
        $this->addSql('DROP TABLE proposal_evaluation');
        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E8347CE583F7');
        $this->addSql('DROP INDEX UNIQ_72E9E8347CE583F7 ON proposal_form');
        $this->addSql('ALTER TABLE proposal_form DROP evaluation_form_id');
        $this->addSql('DROP INDEX IDX_3E7B0BFB456C5646 ON response');
        $this->addSql('ALTER TABLE response DROP evaluation_id');
    }
}
