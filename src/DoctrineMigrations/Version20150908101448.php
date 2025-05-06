<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150908101448 extends AbstractMigration
{
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

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
