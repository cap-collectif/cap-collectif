<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151112115130 extends AbstractMigration
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

        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE594726BF700BD');
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE594726BF700BD FOREIGN KEY (status_id) REFERENCES status (id) ON DELETE SET NULL'
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

        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE594726BF700BD');
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE594726BF700BD FOREIGN KEY (status_id) REFERENCES status (id)'
        );
    }
}
