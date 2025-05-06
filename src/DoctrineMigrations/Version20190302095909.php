<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190302095909 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE INDEX comment_idx_published_trashed_at_proposal_id_object_type_id ON comment (published, trashed_at, proposal_id, objectType, id)'
        );
        $this->addSql('ALTER TABLE proposal DROP comments_count');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'DROP INDEX comment_idx_published_trashed_at_proposal_id_object_type_id ON comment'
        );
        $this->addSql('ALTER TABLE proposal ADD comments_count INT NOT NULL');
    }
}
