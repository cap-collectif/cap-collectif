<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151109134054 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE section ADD step_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE section ADD CONSTRAINT FK_2D737AEF73B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_2D737AEF73B21E9C ON section (step_id)');
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->update('section', ['type' => 'proposals'], ['type' => 'budgets']);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE section DROP FOREIGN KEY FK_2D737AEF73B21E9C');
        $this->addSql('DROP INDEX IDX_2D737AEF73B21E9C ON section');
        $this->addSql('ALTER TABLE section DROP step_id');
    }

    public function postDown(Schema $schema): void
    {
        $this->connection->update('section', ['type' => 'budgets'], ['type' => 'proposals']);
    }
}
