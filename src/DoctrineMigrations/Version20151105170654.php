<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151105170654 extends AbstractMigration
{
    protected $collectSteps = [];

    public function preUp(Schema $schema): void{
        $this->collectSteps = $this->connection->fetchAll(
            '
            SELECT id, proposal_form_id FROM step
            WHERE step_type = ?
        ',
            ['collect']
        );
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE step DROP FOREIGN KEY FK_43B9FE3CA52AB36');
        $this->addSql('DROP INDEX FK_43B9FE3CA52AB36 ON step');
        $this->addSql('ALTER TABLE step DROP proposal_form_id');
        $this->addSql('ALTER TABLE proposal_form ADD step_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E83473B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE UNIQUE INDEX UNIQ_72E9E83473B21E9C ON proposal_form (step_id)');
    }

    public function postUp(Schema $schema): void
    {
        foreach ($this->collectSteps as $step) {
            if ($step['proposal_form_id']) {
                $this->connection->update(
                    'proposal_form',
                    ['step_id' => $step['id']],
                    ['id' => $step['proposal_form_id']]
                );
            }
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E83473B21E9C');
        $this->addSql('DROP INDEX UNIQ_72E9E83473B21E9C ON proposal_form');
        $this->addSql('ALTER TABLE proposal_form DROP step_id');
        $this->addSql('ALTER TABLE step ADD proposal_form_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE step ADD CONSTRAINT FK_43B9FE3CA52AB36 FOREIGN KEY (proposal_form_id) REFERENCES proposal_form (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX FK_43B9FE3CA52AB36 ON step (proposal_form_id)');
    }
}
