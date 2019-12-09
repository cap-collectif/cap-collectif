<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150915094304 extends AbstractMigration
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

        $this->addSql(
            'ALTER TABLE opinion_type ADD subtitle VARCHAR(255) DEFAULT NULL, DROP short_name'
        );
    }

    public function postUp(Schema $schema)
    {
        $consultationSteps = $this->connection->fetchAll(
            'SELECT id, body FROM step WHERE step_type = ?',
            ['consultation']
        );
        foreach ($consultationSteps as $step) {
            if ($step['body'] !== null && false === strpos($step['body'], '<p>')) {
                $newBody = '<p>' . $step['body'] . '</p>';
                $newBody = nl2br($newBody);
                $this->connection->update('step', ['body' => $newBody], ['id' => $step['id']]);
            }
        }
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

        $this->addSql(
            'ALTER TABLE opinion_type ADD short_name VARCHAR(255) NOT NULL, DROP subtitle'
        );
    }

    public function postDown(Schema $schema)
    {
        $consultationSteps = $this->connection->fetchAll(
            'SELECT id, body FROM step WHERE step_type = ?',
            ['consultation']
        );
        foreach ($consultationSteps as $step) {
            if ($step['body'] !== null) {
                $newBody = str_replace('<br>', '\n', $step['body']);
                $newBody = str_replace('<br />', '\n', $step['body']);
                $newBody = str_replace('<br/>', '\n', $step['body']);
                $newBody = str_replace('<p>', '', $newBody);
                $newBody = str_replace('</p>', '', $newBody);
                $this->connection->update('step', ['body' => $newBody], ['id' => $step['id']]);
            }
        }
    }
}
