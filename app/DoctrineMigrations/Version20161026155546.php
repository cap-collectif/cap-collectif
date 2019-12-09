<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20161026155546 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE proposal_relation (proposal_source INT NOT NULL, proposal_target INT NOT NULL, INDEX IDX_83D27B61FE9C1BC4 (proposal_source), INDEX IDX_83D27B61E7794B4B (proposal_target), PRIMARY KEY(proposal_source, proposal_target)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE proposal_relation ADD CONSTRAINT FK_83D27B61FE9C1BC4 FOREIGN KEY (proposal_source) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE proposal_relation ADD CONSTRAINT FK_83D27B61E7794B4B FOREIGN KEY (proposal_target) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE proposal ADD connections_count INT NOT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE proposal_relation');
        $this->addSql('ALTER TABLE proposal DROP connections_count');
    }
}
