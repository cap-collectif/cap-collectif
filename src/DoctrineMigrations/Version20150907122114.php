<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150907122114 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void{
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE step ADD opinion_versions_count INT DEFAULT NULL, ADD trashed_opinion_versions_count INT DEFAULT NULL'
        );
        $this->addSql('ALTER TABLE opinion ADD versions_count INT NOT NULL');
        $this->addSql(
            'ALTER TABLE fos_user ADD opinion_version_votes_count INT NOT NULL, ADD opinion_versions_count INT NOT NULL'
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void{
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE fos_user DROP opinion_version_votes_count, DROP opinion_versions_count'
        );
        $this->addSql('ALTER TABLE opinion DROP versions_count');
        $this->addSql(
            'ALTER TABLE step DROP opinion_versions_count, DROP trashed_opinion_versions_count'
        );
    }
}
