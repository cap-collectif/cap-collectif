<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20161021100903 extends AbstractMigration
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

        $this->addSql('ALTER TABLE proposal ADD update_author_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE594725760469E FOREIGN KEY (update_author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_BFE594725760469E ON proposal (update_author_id)');
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

        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE594725760469E');
        $this->addSql('DROP INDEX IDX_BFE594725760469E ON proposal');
        $this->addSql('ALTER TABLE proposal DROP update_author_id');
    }
}
