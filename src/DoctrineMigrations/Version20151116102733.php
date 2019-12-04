<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151116102733 extends AbstractMigration
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

        $this->addSql('ALTER TABLE reporting ADD proposal_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9FF4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_BD7CFA9FF4792058 ON reporting (proposal_id)');
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

        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9FF4792058');
        $this->addSql('DROP INDEX IDX_BD7CFA9FF4792058 ON reporting');
        $this->addSql('ALTER TABLE reporting DROP proposal_id');
    }
}
