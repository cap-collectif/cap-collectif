<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20180102124120 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
        // TODO: Implement down() method.
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->update(
            'step',
            ['start_at' => null, 'end_at' => null],
            ['step_type' => 'presentation']
        );
    }
}
