<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150417171901 extends AbstractMigration
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
    public function postUp(Schema $schema)
    {
        // create footer title and set it to intro title color
        $header2TitleColor = $this->connection->fetchColumn(
            'SELECT value from site_color where keyname= ?',
            array('color.header2.title')
        );

        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $newColor = [
            'keyname' => 'color.footer.title',
            'title' => 'Titre du pied de page',
            'value' => $header2TitleColor,
            'position' => 21,
            'updated_at' => $date,
            'created_at' => $date,
            'is_enabled' => true,
        ];

        $this->connection->insert('site_color', $newColor);
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema)
    {
        // delete footer title color
        $this->connection->delete('site_color', array('keyname' => 'color.footer.title'));
    }
}
