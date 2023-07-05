<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150817124710 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');

        $updated = ['keyname' => 'admin.mail.notifications.receive_address', 'position' => 1];
        $this->connection->update('site_parameter', $updated, [
            'keyname' => 'admin.mail.notifications',
            'created_at' => $date,
            'updated_at' => $date,
            'is_enabled' => 1,
        ]);

        $parameters = [
            [
                'keyname' => 'admin.mail.notifications.send_name',
                'category' => 'settings.notifications',
                'value' => 'Cap Collectif',
                'position' => 2,
                'type' => 0,
                'created_at' => $date,
                'updated_at' => $date,
                'is_enabled' => 1,
            ],
            [
                'keyname' => 'admin.mail.notifications.send_address',
                'category' => 'settings.notifications',
                'value' => 'assistance@cap-collectif.com',
                'position' => 3,
                'type' => 4,
                'created_at' => $date,
                'updated_at' => $date,
                'is_enabled' => 1,
            ],
        ];
        foreach ($parameters as $values) {
            $this->connection->insert('site_parameter', $values);
        }
    }

    public function down(Schema $schema): void
    {
        $parameters = [
            ['keyname' => 'admin.mail.notifications.send_address'],
            ['keyname' => 'admin.mail.notifications.send_name'],
        ];
        foreach ($parameters as $values) {
            $this->connection->delete('site_parameter', $values);
        }

        $updated = ['keyname' => 'admin.mail.notifications', 'position' => 1];
        $this->connection->update('site_parameter', $updated, [
            'keyname' => 'admin.mail.notifications.receive_address',
        ]);
    }
}
