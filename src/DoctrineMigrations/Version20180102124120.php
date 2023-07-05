<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

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
