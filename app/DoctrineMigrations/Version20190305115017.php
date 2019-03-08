<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190305115017 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE questionnaire ADD private_result TINYINT(1) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE questionnaire DROP private_result');
    }

    public function postUp(Schema $schema)
    {
        $questionnaires = $this->connection->fetchAll('SELECT id from questionnaire');

        $data = [];
        foreach ($questionnaires as $questionnaire) {
            $data['private_result'] = true;

            $this->connection->update('questionnaire', $data, ['id' => $questionnaire['id']]);
        }
    }
}
