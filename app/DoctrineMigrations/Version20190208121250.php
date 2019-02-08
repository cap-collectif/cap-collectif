<?php declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190208121250 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE question ADD result_open TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE questionnaire ADD private_result TINYINT(1) NOT NULL');

    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE question DROP result_open');
        $this->addSql('ALTER TABLE questionnaire DROP private_result');
    }

    public function postUp(Schema $schema)
    {
        $questionnaires = $this->connection->fetchAll('SELECT id from questionnaire');
        $questions = $this->connection->fetchAll('SELECT id, type from $question');

        $data = [];
        foreach ($questionnaires as $questionnaire) {
            $data['private_result'] = true;

            $this->connection->update('questionnaire', $data, ['id' => $questionnaire['id']]);
        }

        $data = [];
        foreach ($questions as $question) {
            if (in_array($question['type'], AbstractQuestion::$questionTypeFree)) {
                $data['result_open'] = false;
            }

            $this->connection->update('question', $data, ['id' => $question['id']]);
        }
    }
}
