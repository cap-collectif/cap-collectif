<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180627103700 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
    }

    public function postUp(Schema $schema): void
    {
        $parameterTypes = SiteParameter::$types;

        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $this->connection->insert('site_parameter', [
            'keyname' => 'global.timezone',
            'value' => 'Europe/Paris',
            'position' => 2,
            'category' => 'settings.global',
            'type' => $parameterTypes['select'],
            'created_at' => $date,
            'updated_at' => $date,
            'is_enabled' => 1
        ]);
    }

    public function postDown(Schema $schema): void
    {
        $this->connection->delete('site_parameter', ['keyname' => 'global.timezone']);
    }
}
