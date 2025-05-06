<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160615193504 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $values = [
            'keyname' => 'blog.content.body',
            'category' => 'pages.blog',
            'value' => '',
            'position' => 771,
            'type' => 1,
            'updated_at' => $date,
            'created_at' => $date,
            'is_enabled' => 1,
        ];

        $this->connection->insert('site_parameter', $values);
    }

    public function down(Schema $schema): void
    {
        // TODO: Implement down() method.
    }
}
