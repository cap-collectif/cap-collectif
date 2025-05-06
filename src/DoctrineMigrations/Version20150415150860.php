<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150415150860 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
    }

    public function postUp(Schema $schema): void
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');

        $this->connection->insert('site_parameter', [
            'keyname' => 'contributors.pagination',
            'title' => "Nombre d'éléments pour la pagination des participants",
            'value' => 18,
            'position' => 730,
            'is_enabled' => 1,
            'type' => 2,
            'created_at' => $date,
            'updated_at' => $date,
        ]);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
    }

    public function postDown(Schema $schema): void
    {
        $this->connection->delete('site_parameter', ['keyname' => 'contributors.pagination']);
    }
}
