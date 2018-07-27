<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * This migration create new global settings key for the organization name
 */
class Version20171108093808 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $date = new \DateTime();
        $created = $date->format('Y-m-d H:i:s');

        $values = [
            'keyname' => 'global.site.organization_name',
            'value' => '',
            'created_at' => $created,
            'updated_at' => $created,
            'is_enabled' => true,
            'position' => 2,
            'type' => 0,
            'category' => 'settings.global',
        ];

        $this->connection->insert("site_parameter", $values);
        $this->connection->update(
            'site_parameter',
            ['position' => 3],
            ['keyname' => 'global.site.embed_js']
        );

        // Add consent external communication to the table user
        $this->addSql(
            'ALTER TABLE fos_user ADD consent_external_communication TINYINT(1) NOT NULL'
        );
    }

    public function down(Schema $schema)
    {
        $this->connection->delete('site_parameter', ['keyname' => 'global.site.organization_name']);
        $this->connection->update(
            'site_parameter',
            ['position' => 2],
            ['keyname' => 'global.site.embed_js']
        );

        // Remove consent external communication to the table user
        $this->addSql('ALTER TABLE fos_user DROP consent_external_communication');
    }
}
