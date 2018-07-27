<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150918093902 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $newColor = [
            'keyname' => 'color.user.vip.bg',
            'value' => '',
            'is_enabled' => true,
            'position' => 28,
            'category' => 'settings.appearance',
            'created_at' => $date,
            'updated_at' => $date,
        ];

        $this->connection->insert('site_color', $newColor);
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->connection->delete('site_color', ['keyname' => 'color.user.vip.bg']);
    }
}
