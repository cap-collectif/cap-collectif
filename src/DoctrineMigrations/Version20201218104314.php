<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20201218104314 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'For or Against as Enum instead of boolean';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE debate_argument CHANGE type type ENUM(\'FOR\', \'AGAINST\')');
        $this->addSql('ALTER TABLE debate_opinion CHANGE type type ENUM(\'FOR\', \'AGAINST\')');
        $this->addSql('ALTER TABLE votes ADD type ENUM(\'FOR\', \'AGAINST\')');
        $this->addSql('ALTER TABLE votes DROP yes_no_value');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE debate_argument CHANGE type type INT NOT NULL');
        $this->addSql('ALTER TABLE debate_opinion CHANGE type type INT NOT NULL');
        $this->addSql('ALTER TABLE votes ADD yes_no_value INT DEFAULT NULL');
        $this->addSql('ALTER TABLE votes DROP type');
    }

    // no need to convert old data format to new as this is not yet used in production
}
