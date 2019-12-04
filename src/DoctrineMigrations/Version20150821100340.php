<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150821100340 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void{
        $keys = [
            'admin.mail.notifications.receive_address',
            'admin.mail.notifications.send_name',
            'admin.mail.notifications.send_address',
        ];

        foreach ($keys as $key) {
            $this->connection->update(
                'site_parameter',
                ['is_enabled' => true],
                ['keyname' => $key]
            );
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void{
    }
}
