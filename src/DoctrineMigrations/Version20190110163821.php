<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20190110163821 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // Add consent internal communication to the table user
        $this->addSql(
            'ALTER TABLE fos_user ADD consent_internal_communication TINYINT(1) NOT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // Remove consent internal communication to the table user
        $this->addSql('ALTER TABLE fos_user DROP consent_internal_communication');
    }
}
