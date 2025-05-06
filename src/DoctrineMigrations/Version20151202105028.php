<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151202105028 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // Fix issues with some site parameters
        $params = [
            'members.pagination.size',
            'members.jumbotron.body',
            'members.jumbotron.title',
            'members.content.body',
        ];

        foreach ($params as $param) {
            $this->connection->update(
                'site_parameter',
                ['category' => 'pages.members'],
                ['keyname' => $param]
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
