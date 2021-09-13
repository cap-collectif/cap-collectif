<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210906135256 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'debate_anonymous_argument.consent_internal_communication';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE debate_anonymous_argument ADD consent_internal_communication TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE debate_anonymous_argument DROP consent_internal_communication');
    }
}
