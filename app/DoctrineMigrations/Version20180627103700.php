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
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );
    }

    public function postUp(Schema $schema)
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
            'is_enabled' => 1,
        ]);
    }

    public function postDown(Schema $schema)
    {
        $this->connection->delete('site_parameter', ['keyname' => 'global.timezone']);
    }
}
