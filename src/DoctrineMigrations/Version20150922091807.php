<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150922091807 extends AbstractMigration
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
            'ALTER TABLE step ADD nb_opinions_to_display INT DEFAULT NULL, ADD nb_versions_to_display INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE consultation ADD opinions_ranking_threshold INT DEFAULT NULL, ADD versions_ranking_threshold INT DEFAULT NULL'
        );
        $this->addSql('ALTER TABLE opinion ADD ranking INT DEFAULT NULL');
        $this->addSql('ALTER TABLE opinion_version ADD ranking INT DEFAULT NULL');
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

        $this->addSql(
            'ALTER TABLE consultation DROP opinions_ranking_threshold, DROP versions_ranking_threshold'
        );
        $this->addSql('ALTER TABLE opinion DROP ranking');
        $this->addSql('ALTER TABLE opinion_version DROP ranking');
        $this->addSql('ALTER TABLE step DROP nb_opinions_to_display, DROP nb_versions_to_display');
    }
}
