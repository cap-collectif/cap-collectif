<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151029110955 extends AbstractMigration
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

        $this->addSql('ALTER TABLE step ADD proposal_form_id INT DEFAULT NULL');

        $this->addSql('ALTER TABLE question DROP FOREIGN KEY FK_B6F7494ECB90598E');
        $this->addSql('DROP TABLE question_type');
        $this->addSql('DROP INDEX IDX_B6F7494ECB90598E ON question');
        $this->addSql('ALTER TABLE question DROP question_type_id');

        $this->addSql('ALTER TABLE question ADD position INT NOT NULL');

        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3CA52AB36 FOREIGN KEY (proposal_form_id) REFERENCES proposal_form (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E83473B21E9C');
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E83473B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE SET NULL'
        );

        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E83473B21E9C');
        $this->addSql('DROP INDEX UNIQ_72E9E83473B21E9C ON proposal_form');
        $this->addSql('ALTER TABLE proposal_form DROP step_id');
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

        $this->addSql('ALTER TABLE proposal_form ADD step_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E83473B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE UNIQUE INDEX UNIQ_72E9E83473B21E9C ON proposal_form (step_id)');

        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E83473B21E9C');
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E83473B21E9C FOREIGN KEY (step_id) REFERENCES step (id)'
        );
        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3CA52AB36');

        $this->addSql('ALTER TABLE question DROP position');

        $this->addSql(
            'CREATE TABLE question_type (id INT AUTO_INCREMENT NOT NULL, type INT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql('ALTER TABLE question ADD question_type_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE question ADD CONSTRAINT FK_B6F7494ECB90598E FOREIGN KEY (question_type_id) REFERENCES question_type (id)'
        );
        $this->addSql('CREATE INDEX IDX_B6F7494ECB90598E ON question (question_type_id)');

        $this->addSql('ALTER TABLE step DROP proposal_form_id');
    }
}
