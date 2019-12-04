<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150428151557 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void{
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void{
        $menu = $this->connection->fetchColumn('SELECT id from menu where type = ?', array(1));

        $this->connection->update(
            'menu_item',
            array('menu_id' => $menu),
            array('link' => 'members', 'is_deletable' => false)
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void{
        // this down() migration is auto-generated, please modify it to your needs
    }
}
