<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150401111728 extends AbstractMigration
{
    public function preUp(Schema $schema)
    {
        $consultations = $this->connection->fetchAll('SELECT id, body FROM consultation c');
        foreach ($consultations as $consultation) {
            $this->connection->update(
                'step',
                array('body' => $consultation['body']),
                array('consultation_id' => $consultation['id'], 'type' => 1)
            );
        }
    }

    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE consultation DROP teaser, DROP body');
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE consultation ADD teaser LONGTEXT DEFAULT NULL COLLATE utf8_unicode_ci, ADD body LONGTEXT DEFAULT NULL COLLATE utf8_unicode_ci'
        );
    }

    public function postDown(Schema $schema)
    {
        $steps = $this->connection->fetchAll(
            'SELECT id, consultation_id, body FROM step WHERE type = 1'
        );
        foreach ($steps as $step) {
            $this->connection->update(
                'consultation',
                array('body' => $step['body']),
                array('id' => $step['consultation_id'])
            );
            $this->connection->update('step', array('body' => null), array('id' => $step['id']));
        }
    }
}
