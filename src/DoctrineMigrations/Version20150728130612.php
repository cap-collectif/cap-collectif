<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150728130612 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE opinion ADD position INT NOT NULL');
        $this->addSql('ALTER TABLE opinion_type ADD default_filter VARCHAR(50) NOT NULL');
    }

    public function postUp(Schema $schema): void
    {
        $types = $this->connection->fetchAllAssociative('SELECT * FROM opinion_type');

        foreach ($types as $type) {
            $this->connection->update(
                'opinion_type',
                ['default_filter' => 'votes'],
                ['id' => $type['id']]
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE opinion DROP position');
        $this->addSql('ALTER TABLE opinion_type DROP default_filter');
    }
}
