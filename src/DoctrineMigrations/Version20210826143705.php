<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210826143705 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'notifications_configuration.email';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE notifications_configuration ADD email VARCHAR(255) DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE notifications_configuration DROP email');
    }
}
