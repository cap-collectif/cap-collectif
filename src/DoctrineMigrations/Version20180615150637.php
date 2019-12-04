<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180615150637 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void
    {
        // TODO: Implement up() method.
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        // TODO: Implement down() method.
    }

    public function postUp(Schema $schema): void
    {
        $users = $this->connection->fetchAll('SELECT id FROM fos_user fu where fu.gender = "u"');
        foreach ($users as $user) {
            $this->connection->update('fos_user', ['gender' => null], ['id' => $user['id']]);
        }
    }

    public function postDown(Schema $schema): void
    {
        $users = $this->connection->fetchAll('SELECT id FROM fos_user where gender IS NULL ');
        foreach ($users as $user) {
            $this->connection->update('fos_user', ['gender' => 'u'], ['id' => $user['id']]);
        }
    }
}
