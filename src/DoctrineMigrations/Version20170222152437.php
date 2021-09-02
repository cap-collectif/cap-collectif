<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170222152437 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
        $date = (new \DateTime())->format('Y-m-d H:i:s');

        $this->connection->insert('site_parameter', [
            'keyname' => 'homepage.meta_description',
            'category' => 'pages.homepage',
            'value' => '',
            'position' => 101,
            'type' => 0,
            'updated_at' => $date,
            'created_at' => $date,
            'is_enabled' => 1,
        ]);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->connection->delete('site_parameter', ['keyname' => 'homepage.meta_description']);
    }
}
