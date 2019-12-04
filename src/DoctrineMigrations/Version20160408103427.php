<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160408103427 extends AbstractMigration
{
    protected $questions = [];
    protected $qaq = [];

    public function preUp(Schema $schema): void{
        $this->connection->exec('DELETE FROM question_choice');
        $this->questions = $this->connection->fetchAll('SELECT * FROM question');
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

        $this->addSql(
            'CREATE TABLE reply (id INT AUTO_INCREMENT NOT NULL, author_id INT DEFAULT NULL, questionnaire_id INT DEFAULT NULL, updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, enabled TINYINT(1) NOT NULL, INDEX IDX_FDA8C6E0F675F31B (author_id), INDEX IDX_FDA8C6E0CE07E8FF (questionnaire_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql('ALTER TABLE proposal_response RENAME TO response');
        $this->addSql('ALTER TABLE response ADD reply_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE response ADD INDEX IDX_3E7B0BFB8A0E4E7F (reply_id)');
        $this->addSql('ALTER TABLE response CHANGE question_id question_id INT NOT NULL');
        $this->addSql(
            'ALTER TABLE response CHANGE value value LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:json)\''
        );
        $this->addSql(
            'CREATE TABLE questionnaire (id INT AUTO_INCREMENT NOT NULL, step_id INT DEFAULT NULL, description LONGTEXT DEFAULT NULL, updated_at DATETIME NOT NULL, theme_help_text VARCHAR(255) DEFAULT NULL, district_help_text VARCHAR(255) DEFAULT NULL, multiple_replies_allowed TINYINT(1) DEFAULT NULL, modify_allowed TINYINT(1) DEFAULT NULL, created_at DATETIME NOT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_7A64DAF73B21E9C (step_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE questionnaire_abstractquestion (id INT AUTO_INCREMENT NOT NULL, questionnaire_id INT DEFAULT NULL, proposal_form_id INT DEFAULT NULL, question_id INT NOT NULL, position INT NOT NULL, INDEX IDX_3D257564CE07E8FF (questionnaire_id), INDEX IDX_3D257564A52AB36 (proposal_form_id), UNIQUE INDEX UNIQ_3D2575641E27F6BF (question_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE reply ADD CONSTRAINT FK_FDA8C6E0F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE reply ADD CONSTRAINT FK_FDA8C6E0CE07E8FF FOREIGN KEY (questionnaire_id) REFERENCES questionnaire (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE response ADD CONSTRAINT FK_3E7B0BFB8A0E4E7F FOREIGN KEY (reply_id) REFERENCES reply (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE questionnaire ADD CONSTRAINT FK_7A64DAF73B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE questionnaire_abstractquestion ADD CONSTRAINT FK_3D257564CE07E8FF FOREIGN KEY (questionnaire_id) REFERENCES questionnaire (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE questionnaire_abstractquestion ADD CONSTRAINT FK_3D257564A52AB36 FOREIGN KEY (proposal_form_id) REFERENCES proposal_form (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE questionnaire_abstractquestion ADD CONSTRAINT FK_3D2575641E27F6BF FOREIGN KEY (question_id) REFERENCES question (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE step ADD replies_count INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE question_choice ADD image_id INT DEFAULT NULL, ADD description LONGTEXT DEFAULT NULL, ADD title VARCHAR(255) NOT NULL, ADD slug VARCHAR(255) NOT NULL, ADD position INT NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE question_choice ADD CONSTRAINT FK_C6F6759A3DA5256D FOREIGN KEY (image_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_C6F6759A3DA5256D ON question_choice (image_id)');
        $this->addSql('ALTER TABLE question DROP FOREIGN KEY FK_B6F7494EA52AB36');
        $this->addSql('DROP INDEX IDX_B6F7494EA52AB36 ON question');
        $this->addSql(
            'ALTER TABLE question ADD type VARCHAR(255) NOT NULL, ADD question_type VARCHAR(255) NOT NULL, ADD random_question_choices TINYINT(1) DEFAULT NULL, ADD other_allowed TINYINT(1) DEFAULT NULL, DROP proposal_form_id, DROP questionType, DROP position, CHANGE helptext help_text LONGTEXT DEFAULT NULL'
        );
        $this->addSql('ALTER TABLE fos_user ADD replies_count INT NOT NULL');
    }

    public function postUp(Schema $schema): void{
        foreach ($this->questions as $question) {
            $this->connection->insert('questionnaire_abstractquestion', [
                'questionnaire_id' => null,
                'proposal_form_id' => $question['proposal_form_id'],
                'question_id' => $question['id'],
                'position' => $question['position'],
            ]);
            $this->connection->update(
                'question',
                [
                    'question_type' => 'simple',
                    'type' => $question['questionType'],
                    'other_allowed' => false,
                    'random_question_choices' => false,
                ],
                ['id' => $question['id']]
            );
        }
    }

    public function preDown(Schema $schema): void{
        $this->connection->exec('DELETE FROM question_choice');
        $this->connection->delete('response', ['proposal_id' => null]);
        $this->questions = $this->connection->fetchAll('SELECT * FROM question');
        $this->qaq = $this->connection->fetchAll('SELECT * FROM questionnaire_abstractquestion');
        foreach ($this->qaq as $qaq) {
            if ($qaq['proposal_form_id'] === null) {
                $this->connection->delete('response', ['question_id' => $qaq['question_id']]);
                $this->connection->delete('question', ['id' => $qaq['question_id']]);
                $this->connection->delete('questionnaire_abstractquestion', ['id' => $qaq['id']]);
            }
        }
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

        $this->addSql('ALTER TABLE response DROP FOREIGN KEY FK_3E7B0BFB8A0E4E7F');
        $this->addSql('ALTER TABLE response DROP reply_id');
        $this->addSql('ALTER TABLE response CHANGE question_id question_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE response CHANGE value value LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE response RENAME TO proposal_response');
        $this->addSql('ALTER TABLE reply DROP FOREIGN KEY FK_FDA8C6E0CE07E8FF');
        $this->addSql(
            'ALTER TABLE questionnaire_abstractquestion DROP FOREIGN KEY FK_3D257564CE07E8FF'
        );
        $this->addSql('DROP TABLE reply');
        $this->addSql('DROP TABLE questionnaire');
        $this->addSql('DROP TABLE questionnaire_abstractquestion');
        $this->addSql('ALTER TABLE fos_user DROP replies_count');
        $this->addSql(
            'ALTER TABLE question ADD proposal_form_id INT DEFAULT NULL, ADD questionType INT NOT NULL, ADD position INT NOT NULL, DROP type, DROP question_type, DROP random_question_choices, DROP other_allowed, CHANGE help_text helpText LONGTEXT DEFAULT NULL COLLATE utf8_unicode_ci'
        );
        $this->addSql(
            'ALTER TABLE question ADD CONSTRAINT FK_B6F7494EA52AB36 FOREIGN KEY (proposal_form_id) REFERENCES proposal_form (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_B6F7494EA52AB36 ON question (proposal_form_id)');
        $this->addSql('ALTER TABLE question_choice DROP FOREIGN KEY FK_C6F6759A3DA5256D');
        $this->addSql('DROP INDEX IDX_C6F6759A3DA5256D ON question_choice');
        $this->addSql(
            'ALTER TABLE question_choice DROP image_id, DROP description, DROP title, DROP slug, DROP position'
        );
        $this->addSql('ALTER TABLE step DROP replies_count');
    }

    public function postDown(Schema $schema): void
    {
        foreach ($this->questions as $question) {
            $this->connection->update(
                'question',
                ['questionType' => $question['type']],
                ['id' => $question['id']]
            );
        }
        foreach ($this->qaq as $qaq) {
            $this->connection->update(
                'question',
                ['proposal_form_id' => $qaq['proposal_form_id'], 'position' => $qaq['position']],
                ['id' => $qaq['question_id']]
            );
        }
        $this->connection->exec(
            'ALTER TABLE question CHANGE proposal_form_id proposal_form_id INT NOT NULL'
        );
    }
}
