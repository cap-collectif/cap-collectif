<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210311112043 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add widget_origin_url and external_origin to debate_argument, votes, debate_anonymous_vote';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE debate_argument ADD widget_origin_url VARCHAR(255) DEFAULT NULL, ADD external_origin ENUM(\'MAIL\', \'WIDGET\')'
        );
        $this->addSql(
            'ALTER TABLE votes ADD widget_origin_url VARCHAR(255) DEFAULT NULL, ADD external_origin ENUM(\'MAIL\', \'WIDGET\')'
        );
        $this->addSql(
            'ALTER TABLE debate_anonymous_vote ADD widget_origin_url VARCHAR(255) DEFAULT NULL, ADD external_origin ENUM(\'MAIL\', \'WIDGET\')'
        );
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE debate_argument DROP widget_origin_url, DROP external_origin');
        $this->addSql('ALTER TABLE votes DROP widget_origin_url, DROP external_origin');
        $this->addSql(
            'ALTER TABLE debate_anonymous_vote DROP widget_origin_url, DROP external_origin'
        );
    }
}
