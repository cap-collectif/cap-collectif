<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210119161323 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'remove votes_count from argument, comment, source';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE argument DROP votes_count');
        $this->addSql('ALTER TABLE comment DROP votes_count');
        $this->addSql('ALTER TABLE source DROP votes_count');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE argument ADD votes_count INT NOT NULL');
        $this->addSql('ALTER TABLE comment ADD votes_count INT NOT NULL');
        $this->addSql('ALTER TABLE source ADD votes_count INT NOT NULL');
    }
}
