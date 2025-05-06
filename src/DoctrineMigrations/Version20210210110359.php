<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210210110359 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'ip adress in DebateArgument and DebateVotes';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE debate_argument ADD ip_address VARCHAR(255) DEFAULT NULL, ADD navigator LONGTEXT DEFAULT NULL'
        );
        $this->addSql('ALTER TABLE votes ADD navigator LONGTEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE debate_argument DROP ip_address, DROP navigator');
        $this->addSql('ALTER TABLE votes DROP navigator');
    }
}
