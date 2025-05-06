<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150915094304 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE opinion_type ADD subtitle VARCHAR(255) DEFAULT NULL, DROP short_name'
        );
    }

    public function postUp(Schema $schema): void
    {
        $consultationSteps = $this->connection->fetchAllAssociative(
            'SELECT id, body FROM step WHERE step_type = ?',
            ['consultation']
        );
        foreach ($consultationSteps as $step) {
            if (null !== $step['body'] && !str_contains((string) $step['body'], '<p>')) {
                $newBody = '<p>' . $step['body'] . '</p>';
                $newBody = nl2br($newBody);
                $this->connection->update('step', ['body' => $newBody], ['id' => $step['id']]);
            }
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE opinion_type ADD short_name VARCHAR(255) NOT NULL, DROP subtitle'
        );
    }

    public function postDown(Schema $schema): void
    {
        $consultationSteps = $this->connection->fetchAllAssociative(
            'SELECT id, body FROM step WHERE step_type = ?',
            ['consultation']
        );
        foreach ($consultationSteps as $step) {
            if (null !== $step['body']) {
                $newBody = str_replace('<br>', '\n', (string) $step['body']);
                $newBody = str_replace('<br />', '\n', (string) $step['body']);
                $newBody = str_replace('<br/>', '\n', (string) $step['body']);
                $newBody = str_replace('<p>', '', $newBody);
                $newBody = str_replace('</p>', '', $newBody);
                $this->connection->update('step', ['body' => $newBody], ['id' => $step['id']]);
            }
        }
    }
}
