<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180615150637 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // TODO: Implement up() method.
    }

    public function down(Schema $schema): void
    {
        // TODO: Implement down() method.
    }

    public function postUp(Schema $schema): void
    {
        $users = $this->connection->fetchAllAssociative(
            'SELECT id FROM fos_user fu where fu.gender = "u"'
        );
        foreach ($users as $user) {
            $this->connection->update('fos_user', ['gender' => null], ['id' => $user['id']]);
        }
    }

    public function postDown(Schema $schema): void
    {
        $users = $this->connection->fetchAllAssociative(
            'SELECT id FROM fos_user where gender IS NULL '
        );
        foreach ($users as $user) {
            $this->connection->update('fos_user', ['gender' => 'u'], ['id' => $user['id']]);
        }
    }
}
