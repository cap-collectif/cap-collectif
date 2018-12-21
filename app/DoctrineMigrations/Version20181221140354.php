<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181221140354 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('CREATE INDEX idx_author ON opinion (id, author_id)');
        $this->addSql('CREATE INDEX idx_author ON source (id, author_id)');
        $this->addSql('CREATE INDEX idx_author ON argument (id, author_id)');
        $this->addSql('CREATE INDEX idx_author ON opinion_version (id, author_id)');
        $this->addSql('CREATE INDEX idx_author ON proposal (id, author_id)');
        $this->addSql('CREATE INDEX idx_author ON reply (id, author_id)');
        $this->addSql('CREATE INDEX collectstep_voter_idx ON votes (voter_id, collect_step_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP INDEX idx_author ON argument');
        $this->addSql('DROP INDEX idx_author ON opinion');
        $this->addSql('DROP INDEX idx_author ON opinion_version');
        $this->addSql('DROP INDEX idx_author ON proposal');
        $this->addSql('DROP INDEX idx_author ON reply');
        $this->addSql('DROP INDEX idx_author ON source');
        $this->addSql('DROP INDEX collectstep_voter_idx ON votes');
    }
}
