<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260918120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove the legacy Hub API Green token from external service configuration';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("DELETE FROM external_service_configuration WHERE type = 'hub_api_green_token'");
    }

    public function down(Schema $schema): void
    {
        // The deleted credential cannot be restored.
    }
}
