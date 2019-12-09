<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160125014848 extends AbstractMigration
{
    public function up(Schema $schema): void
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

    public function down(Schema $schema): void
    {
    }
}
