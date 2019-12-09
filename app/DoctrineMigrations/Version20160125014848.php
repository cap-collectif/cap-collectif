<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160125014848 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        $this->connection->update(
            'site_parameter',
            ['category' => 'pages.projects'],
            ['category' => 'pages.consultations']
        );
        $this->connection->update(
            'site_image',
            ['category' => 'pages.projects'],
            ['category' => 'pages.consultations']
        );
        $this->connection->update(
            'site_color',
            ['category' => 'pages.projects'],
            ['category' => 'pages.consultations']
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
    }
}
