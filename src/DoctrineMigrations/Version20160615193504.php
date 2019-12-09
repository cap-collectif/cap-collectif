<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160615193504 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $values = [
            'keyname' => 'blog.content.body',
            'category' => 'pages.blog',
            'value' => '',
            'position' => 771,
            'type' => 1
        ];

        $this->connection->insert('site_parameter', $values);
    }

    public function down(Schema $schema): void
    {
        // TODO: Implement down() method.
    }
}
