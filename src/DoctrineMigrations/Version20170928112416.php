<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170928112416 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE response DROP FOREIGN KEY FK_DF2037D3F4792058');
        $this->addSql('DROP INDEX idx_df2037d3f4792058 ON response');
        $this->addSql('CREATE INDEX IDX_3E7B0BFBF4792058 ON response (proposal_id)');
        $this->addSql(
            'ALTER TABLE response ADD CONSTRAINT FK_DF2037D3F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE response DROP FOREIGN KEY FK_3E7B0BFBF4792058');
        $this->addSql('DROP INDEX idx_3e7b0bfbf4792058 ON response');
        $this->addSql('CREATE INDEX IDX_DF2037D3F4792058 ON response (proposal_id)');
        $this->addSql(
            'ALTER TABLE response ADD CONSTRAINT FK_3E7B0BFBF4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
    }
}
