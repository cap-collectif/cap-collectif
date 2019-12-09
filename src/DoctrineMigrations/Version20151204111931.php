<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151204111931 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $users = $this->connection->fetchAll('SELECT id FROM fos_user WHERE slug = ?', ['']);
        foreach ($users as $user) {
            $newSlug = substr(md5(uniqid(rand(), true)), 0, 10);
            $this->connection->update('fos_user', ['slug' => $newSlug], ['id' => $user['id']]);
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
