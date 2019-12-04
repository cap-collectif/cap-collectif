<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160817102554 extends AbstractMigration
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

        $this->addSql('ALTER TABLE proposal_form ADD district_mandatory TINYINT(1)');
        $this->addSql('UPDATE proposal_form SET district_mandatory=0');
        $this->addSql('ALTER TABLE proposal_form MODIFY district_mandatory TINYINT(1) NOT NULL');

        $this->addSql('ALTER TABLE proposal_form ADD using_district TINYINT(1)');
        $this->addSql('UPDATE proposal_form SET using_district=0');
        $this->addSql('ALTER TABLE proposal_form MODIFY using_district TINYINT(1) NOT NULL');
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

        $this->addSql('ALTER TABLE proposal_form DROP district_mandatory, DROP using_district');
    }
}
