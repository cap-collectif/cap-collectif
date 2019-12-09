<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170222161952 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
    }

    public function postUp(Schema $schema): void
    {
        $deleteParameters = ['security.shield_mode.username', 'security.shield_mode.password'];
        foreach ($deleteParameters as $keyname) {
            $this->connection->delete('site_parameter', ['keyname' => $keyname]);
        }
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
    }
}
