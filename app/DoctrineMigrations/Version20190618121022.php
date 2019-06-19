<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190618121022 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }

    public function preUp(Schema $schema): void
    {
        $table = 'proposal';
        $proposalDraft = $this->connection->fetchAll("SELECT id FROM ${table} where is_draft = 1");
        foreach ($proposalDraft as $proposal) {
            $this->connection->update(
                $table,
                ['publishedAt' => null, 'published' => false],
                ['id' => $proposal['id']]
            );
        }
    }
}
