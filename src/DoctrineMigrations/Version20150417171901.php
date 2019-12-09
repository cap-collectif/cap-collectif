<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150417171901 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        // create footer title and set it to intro title color
        $header2TitleColor = $this->connection->fetchColumn(
            'SELECT value from site_color where keyname= ?',
            ['color.header2.title']
        );

        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $newColor = [
            'keyname' => 'color.footer.title',
            'title' => 'Titre du pied de page',
            'value' => $header2TitleColor,
            'position' => 21,
            'updated_at' => $date,
            'created_at' => $date,
            'is_enabled' => true
        ];

        $this->connection->insert('site_color', $newColor);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }

    public function postDown(Schema $schema): void
    {
        // delete footer title color
        $this->connection->delete('site_color', ['keyname' => 'color.footer.title']);
    }
}
