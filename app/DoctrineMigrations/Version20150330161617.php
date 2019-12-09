<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150330161617 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema)
    {
        $newTitles = [
            'color.header.bg' => "Fond de l'en-tête",
            'color.header2.bg' => "Fond de l'en-tête secondaire",
            'color.btn.primary' => "Couleur primaire",
            'color.btn' => "Bouton de l'en-tête",
            'color.footer.bg' => "Fond du pied de page",
        ];

        foreach ($newTitles as $key => $title) {
            $this->connection->update(
                'site_color',
                array('title' => $title),
                array('keyname' => $key)
            );
        }
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
