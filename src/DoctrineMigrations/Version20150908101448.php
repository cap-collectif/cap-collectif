<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150908101448 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void
    {
        $newKeys = [
            'color.btn.ghost.bg' => 'color.btn.ghost.hover',
            'color.btn.ghost.text' => 'color.btn.ghost.base',
        ];

        foreach ($newKeys as $old => $new) {
            $this->connection->update('site_color', ['keyname' => $new], ['keyname' => $old]);
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
