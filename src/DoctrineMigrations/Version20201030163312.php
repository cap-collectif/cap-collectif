<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20201030163312 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'fix error of type in emailingcampaign.content';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE emailing_campaign CHANGE content content LONGTEXT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE emailing_campaign CHANGE content content VARCHAR(255) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`'
        );
    }
}
