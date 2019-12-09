<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150220180550 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
    }

    public function postUp(Schema $schema): void
    {
        $parameters = [
            'login.text.top',
            'login.text.bottom',
            'signin.text.top',
            'signin.text.bottom'
        ];

        foreach ($parameters as $keyname) {
            $this->connection->update('site_parameter', ['type' => 1], ['keyname' => $keyname]);
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
