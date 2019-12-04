<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20161011181359 extends AbstractMigration
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

        $this->addSql('alter table proposal drop foreign key FK_BFE59472F675F31B');
        $this->addSql('alter table proposal drop foreign key FK_BFE59472A52AB36');
        $this->addSql('update step SET vote_type = 0 where step_type = "collect"');
        $this->addSql(
            'ALTER TABLE proposal DROP votes_count, CHANGE proposal_form_id proposal_form_id INT NOT NULL, CHANGE author_id author_id INT NOT NULL'
        );
        $this->addSql('ALTER TABLE votes ADD collect_step_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF330C62D6 FOREIGN KEY (collect_step_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_518B7ACF330C62D6 ON votes (collect_step_id)');
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
            'ALTER TABLE proposal ADD votes_count INT NOT NULL, CHANGE author_id author_id INT DEFAULT NULL, CHANGE proposal_form_id proposal_form_id INT DEFAULT NULL'
        );
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACF330C62D6');
        $this->addSql('DROP INDEX IDX_518B7ACF330C62D6 ON votes');
        $this->addSql('ALTER TABLE votes DROP collect_step_id');
    }
}
