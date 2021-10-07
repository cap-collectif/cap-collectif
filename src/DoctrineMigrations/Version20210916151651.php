<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210916151651 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'facebookSSOconfiguration';
    }

    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->insert('sso_configuration', [
            'id' => 'facebook',
            'name' => 'facebook',
            'ssoType' => 'facebook',
            'enabled' => 0,
            'client_id' => '',
            'secret' => '',
        ]);
    }
}
