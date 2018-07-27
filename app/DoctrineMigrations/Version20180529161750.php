<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180529161750 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema)
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');

        $this->connection->insert('site_color', [
            'keyname' => 'color.bg.primary',
            'category' => 'settings.appearance',
            'created_at' => $date,
            'updated_at' => $date,
            'value' => '#e3e3e3',
            'position' => 34,
        ]);
    }

    public function postDown(Schema $schema)
    {
        $this->connection->delete('site_color', ['keyname' => 'color.bg.primary']);
    }
}
