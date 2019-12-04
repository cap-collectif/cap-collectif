<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150415150859 extends AbstractMigration
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

        $this->addSql('ALTER TABLE consultation ADD published_at DATETIME NOT NULL');
        $this->addSql(
            'ALTER TABLE menu_item CHANGE isfullymodifiable is_fully_modifiable TINYINT(1) NOT NULL'
        );
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->executeQuery('UPDATE consultation c SET c.published_at = c.created_at');
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

        $this->addSql('ALTER TABLE consultation DROP published_at');
        $this->addSql(
            'ALTER TABLE menu_item CHANGE is_fully_modifiable isFullyModifiable TINYINT(1) NOT NULL'
        );
    }
}
