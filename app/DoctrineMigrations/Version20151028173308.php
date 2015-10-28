<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151028173308 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE proposal ADD district_id INT DEFAULT NULL, CHANGE vote_count status_id INT NOT NULL');
        $this->addSql('ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472B08FA272 FOREIGN KEY (district_id) REFERENCES district (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE proposal ADD CONSTRAINT FK_BFE594726BF700BD FOREIGN KEY (status_id) REFERENCES status (id)');
        $this->addSql('CREATE INDEX IDX_BFE59472B08FA272 ON proposal (district_id)');
        $this->addSql('CREATE INDEX IDX_BFE594726BF700BD ON proposal (status_id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472B08FA272');
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE594726BF700BD');
        $this->addSql('DROP INDEX IDX_BFE59472B08FA272 ON proposal');
        $this->addSql('DROP INDEX IDX_BFE594726BF700BD ON proposal');
        $this->addSql('ALTER TABLE proposal DROP district_id, CHANGE status_id vote_count INT NOT NULL');
    }
}
