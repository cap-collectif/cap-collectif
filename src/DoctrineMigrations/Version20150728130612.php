<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150728130612 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE opinion ADD position INT NOT NULL');
        $this->addSql('ALTER TABLE opinion_type ADD default_filter VARCHAR(50) NOT NULL');
    }

    public function postUp(Schema $schema): void
    {
        $types = $this->connection->fetchAll('SELECT * FROM opinion_type');

        foreach ($types as $type) {
            $this->connection->update(
                'opinion_type',
                ['default_filter' => 'votes'],
                ['id' => $type['id']]
            );
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE opinion DROP position');
        $this->addSql('ALTER TABLE opinion_type DROP default_filter');
    }
}
