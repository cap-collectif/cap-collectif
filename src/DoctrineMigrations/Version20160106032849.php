<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160106032849 extends AbstractMigration
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

        $this->addSql('ALTER TABLE votes ADD selection_step_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFDB15B87D FOREIGN KEY (selection_step_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_518B7ACFDB15B87D ON votes (selection_step_id)');
        $this->addSql('ALTER TABLE step ADD votes_count INT DEFAULT NULL');
        $this->addSql('ALTER TABLE fos_user ADD proposal_votes_count INT NOT NULL');
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

        $this->addSql('ALTER TABLE fos_user DROP proposal_votes_count');
        $this->addSql('ALTER TABLE step DROP votes_count');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACFDB15B87D');
        $this->addSql('DROP INDEX IDX_518B7ACFDB15B87D ON votes');
        $this->addSql('ALTER TABLE votes DROP selection_step_id');
    }
}
