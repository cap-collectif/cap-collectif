<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20170929161455 extends AbstractMigration
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
            'CREATE UNIQUE INDEX UNIQ_BFE59472A52AB36AEA34913 ON proposal (proposal_form_id, reference)'
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

        $this->addSql('DROP INDEX UNIQ_BFE59472A52AB36AEA34913 ON proposal');
    }
}
