<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200220140350 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        $this->connection->update(
            'locale',
            ['code' => 'sv-SE'],
            ['traduction_key' => 'swedish']
        );
    }

    public function down(Schema $schema) : void
    {
        $this->connection->update(
            'locale',
            ['code' => 'sv-SV'],
            ['traduction_key' => 'swedish']
        );
    }
}
