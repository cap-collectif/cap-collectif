<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20171201133108 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE proposal_evaluation ADD version INT DEFAULT 1 NOT NULL');
    }

    public function postUp(Schema $schema)
    {
        echo '-> Setting version for existing proposal evaluations...' . PHP_EOL;
        $proposalsEvaluation = $this->connection->fetchAll('SELECT id, version from proposal_evaluation');
        foreach ($proposalsEvaluation as $proposalEvaluation) {
            if (!$proposalEvaluation['version']) {
                $this->connection->update('proposal_evaluation', ['version' => 1], ['id' => $proposalEvaluation['id']]);
            }
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE proposal_evaluation DROP version');
    }
}
