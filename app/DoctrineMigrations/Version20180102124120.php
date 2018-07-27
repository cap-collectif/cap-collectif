<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20180102124120 extends AbstractMigration
{
    public function up(Schema $schema)
    {
    }

    public function down(Schema $schema)
    {
        // TODO: Implement down() method.
    }

    public function postUp(Schema $schema)
    {
        $this->connection->update(
            'step',
            array('start_at' => null, 'end_at' => null),
            array('step_type' => 'presentation')
        );
    }
}
