<?php
namespace Application\Migrations;

use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180525135721 extends AbstractMigration
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

        $this->addSql('ALTER TABLE site_parameter ADD help_text LONGTEXT DEFAULT NULL');
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

        $this->addSql('ALTER TABLE site_parameter DROP help_text');
    }

    public function postUp(Schema $schema)
    {
        $parameterTypes = SiteParameter::$types;

        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $this->connection->insert('site_parameter', array(
            'keyname' => 'snalytical-tracking-scripts-on-all-pages',
            'help_text' => 'for-analytical-scripts-only  script-desactivatable-by-user',
            'value' => '',
            'position' => 3,
            'category' => 'settings.global',
            'type' => $parameterTypes['javascript'],
            'created_at' => $date,
            'updated_at' => $date,
        ));
        $this->connection->insert('site_parameter', array(
            'keyname' => 'ad-scripts-on-all-pages',
            'help_text' => 'reserved-for-ad-scripts  script-desactivatable-by-user',
            'value' => '',
            'position' => 3,
            'category' => 'settings.global',
            'type' => $parameterTypes['javascript'],
            'created_at' => $date,
            'updated_at' => $date,
        ));
    }

    public function postDown(Schema $schema)
    {
        $this->connection->delete('site_image', [
            'keyname' => 'snalytical-tracking-scripts-on-all-pages',
        ]);
        $this->connection->delete('site_image', ['keyname' => 'ad-scripts-on-all-pages']);
    }
}
