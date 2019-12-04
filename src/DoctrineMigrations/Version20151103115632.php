<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151103115632 extends AbstractMigration
{
    public function preUp(Schema $schema): void{
        $responses = $this->connection->fetchAll('SELECT id, created_at FROM proposal_response');
        foreach ($responses as $response) {
            $proposals = $this->connection->fetchAll(
                'SELECT id, proposal_form_id FROM proposal WHERE created_at = ?',
                [$response['created_at']]
            );
            if (count($proposals) > 0) {
                $proposal = $proposals[0];
                $question = $this->connection->fetchAll(
                    'SELECT id FROM question WHERE proposal_form_id = ?',
                    [$proposal['proposal_form_id']]
                )[0];
                $this->connection->update(
                    'proposal_response',
                    ['proposal_id' => $proposal['id'], 'question_id' => $question['id']],
                    ['id' => $response['id']]
                );
            }
        }
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void{
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal_response DROP FOREIGN KEY FK_DF2037D31E27F6BF');
        $this->addSql('ALTER TABLE proposal_response DROP FOREIGN KEY FK_DF2037D3F4792058');
        $this->addSql('ALTER TABLE question DROP FOREIGN KEY FK_B6F7494EA52AB36');
        $this->addSql(
            'ALTER TABLE proposal_response CHANGE question_id question_id INT NOT NULL, CHANGE proposal_id proposal_id INT NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE question ADD questionType INT NOT NULL, CHANGE proposal_form_id proposal_form_id INT NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE proposal_response ADD CONSTRAINT FK_DF2037D31E27F6BF FOREIGN KEY (question_id) REFERENCES question (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE proposal_response ADD CONSTRAINT FK_DF2037D3F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE question ADD CONSTRAINT FK_B6F7494EA52AB36 FOREIGN KEY (proposal_form_id) REFERENCES proposal_form (id)'
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void{
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal_response DROP FOREIGN KEY FK_DF2037D31E27F6BF');
        $this->addSql('ALTER TABLE proposal_response DROP FOREIGN KEY FK_DF2037D3F4792058');
        $this->addSql('ALTER TABLE question DROP FOREIGN KEY FK_B6F7494EA52AB36');
        $this->addSql(
            'ALTER TABLE proposal_response CHANGE proposal_id proposal_id INT DEFAULT NULL, CHANGE question_id question_id INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE question DROP questionType, CHANGE proposal_form_id proposal_form_id INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE proposal_response ADD CONSTRAINT FK_DF2037D31E27F6BF FOREIGN KEY (question_id) REFERENCES question (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE proposal_response ADD CONSTRAINT FK_DF2037D3F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE question ADD CONSTRAINT FK_B6F7494EA52AB36 FOREIGN KEY (proposal_form_id) REFERENCES proposal_form (id)'
        );
    }
}
