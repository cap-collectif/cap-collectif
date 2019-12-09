<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150401111728 extends AbstractMigration
{
    public function preUp(Schema $schema): void
    {
        $consultations = $this->connection->fetchAll('SELECT id, body FROM consultation c');
        foreach ($consultations as $consultation) {
            $this->connection->update(
                'step',
                ['body' => $consultation['body']],
                ['consultation_id' => $consultation['id'], 'type' => 1]
            );
        }
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE consultation DROP teaser, DROP body');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE consultation ADD teaser LONGTEXT DEFAULT NULL COLLATE utf8_unicode_ci, ADD body LONGTEXT DEFAULT NULL COLLATE utf8_unicode_ci'
        );
    }

    public function postDown(Schema $schema): void
    {
        $steps = $this->connection->fetchAll(
            'SELECT id, consultation_id, body FROM step WHERE type = 1'
        );
        foreach ($steps as $step) {
            $this->connection->update(
                'consultation',
                ['body' => $step['body']],
                ['id' => $step['consultation_id']]
            );
            $this->connection->update('step', ['body' => null], ['id' => $step['id']]);
        }
    }
}
