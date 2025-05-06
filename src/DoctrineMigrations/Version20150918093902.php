<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150918093902 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $newColor = [
            'keyname' => 'color.user.vip.bg',
            'value' => '',
            'is_enabled' => 1,
            'position' => 28,
            'category' => 'settings.appearance',
            'created_at' => $date,
            'updated_at' => $date,
        ];

        $this->connection->insert('site_color', $newColor);
    }

    public function down(Schema $schema): void
    {
        $this->connection->delete('site_color', ['keyname' => 'color.user.vip.bg']);
    }
}
