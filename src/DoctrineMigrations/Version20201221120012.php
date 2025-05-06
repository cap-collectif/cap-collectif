<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201221120012 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE votes ADD debate_argument_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF39A6B6F6 FOREIGN KEY (debate_id) REFERENCES debate (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFB1B4F3D5 FOREIGN KEY (debate_argument_id) REFERENCES debate_argument (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_518B7ACFB1B4F3D5 ON votes (debate_argument_id)');
        $this->addSql('CREATE UNIQUE INDEX debate_vote_unique ON votes (voter_id, debate_id)');
        $this->addSql(
            'CREATE UNIQUE INDEX debate_argument_vote_unique ON votes (voter_id, debate_argument_id)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX argument_debate_unique ON debate_argument (debate_id, author_id)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP INDEX argument_debate_unique ON debate_argument');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACF39A6B6F6');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACFB1B4F3D5');
        $this->addSql('DROP INDEX IDX_518B7ACFB1B4F3D5 ON votes');
        $this->addSql('DROP INDEX debate_vote_unique ON votes');
        $this->addSql('DROP INDEX debate_argument_vote_unique ON votes');
        $this->addSql('ALTER TABLE votes DROP debate_argument_id');
    }
}
