<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20201012110216 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'undraftAt';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal ADD undraft_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE reply ADD undraft_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal DROP undraft_at');
        $this->addSql('ALTER TABLE reply DROP undraft_at');
    }

    public function postUp(Schema $schema): void
    {
        $this->setUndraftAtForUndraftedEntities('proposal');
        $this->setUndraftAtForUndraftedEntities('reply');
    }

    private function setUndraftAtForUndraftedEntities(string $type): void
    {
        foreach ($this->getUndraftedEntities($type) as $data) {
            $this->setUndraftAt($type, $data);
        }
    }

    private function getUndraftedEntities(string $type): array
    {
        return $this->connection->fetchAll(
            "SELECT id, publishedAt, created_at FROM $type WHERE is_draft = false"
        );
    }

    private function setUndraftAt(string $type, array $data): void
    {
        $this->connection->update(
            $type,
            ['undraft_at' => $data['publishedAt'] ?? $data['created_at']],
            ['id' => $data['id']]
        );
    }
}
