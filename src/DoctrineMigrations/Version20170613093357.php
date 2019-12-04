<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170613093357 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void{
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE proposal ADD location LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:json)\''
        );
        $this->addSql('ALTER TABLE proposal_form ADD using_address TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE proposal_form ADD address_help_text VARCHAR(255) DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE proposal_form ADD zoom_map INT DEFAULT NULL, ADD lat_map DOUBLE PRECISION DEFAULT NULL, ADD lng_map DOUBLE PRECISION DEFAULT NULL'
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void{
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal DROP location');
        $this->addSql('ALTER TABLE proposal_form DROP using_address');
        $this->addSql('ALTER TABLE proposal_form DROP address_help_text');
        $this->addSql('ALTER TABLE proposal_form DROP zoom_map, DROP lat_map, DROP lng_map');
    }
}
