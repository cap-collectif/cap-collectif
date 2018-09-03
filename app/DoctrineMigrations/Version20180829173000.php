<?php
namespace Application\Migrations;

use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180829173000 extends AbstractMigration
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
            'keyname' => 'mailjet.keys.public',
            'value' => '',
            'position' => 4,
            'category' => 'settings.notifications',
            'type' => $parameterTypes['simple_text'],
            'created_at' => $date,
            'updated_at' => $date,
            'is_enabled' => 1,
        ]);
        $this->connection->insert('site_parameter', [
            'keyname' => 'mailjet.keys.secret',
            'value' => '',
            'position' => 5,
            'category' => 'settings.notifications',
            'type' => $parameterTypes['simple_text'],
            'created_at' => $date,
            'updated_at' => $date,
            'is_enabled' => 1,
        ]);
    }

    public function postDown(Schema $schema)
    {
        $this->connection->delete('site_parameter', ['keyname' => 'mailjet.keys.public']);
        $this->connection->delete('site_parameter', ['keyname' => 'mailjet.keys.secret']);
    }
}
