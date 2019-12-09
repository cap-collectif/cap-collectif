<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151030144445 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE collect_step_statuses');
        $this->addSql('ALTER TABLE idea CHANGE vote_count votes_count INT NOT NULL');
        $this->addSql('ALTER TABLE comment CHANGE vote_count votes_count INT NOT NULL');
        $this->addSql('ALTER TABLE argument CHANGE vote_count votes_count INT NOT NULL');
        $this->addSql('ALTER TABLE source CHANGE vote_count_source votes_count INT NOT NULL');
        $this->addSql(
            'ALTER TABLE proposal ADD district_id INT DEFAULT NULL, ADD status_id INT NOT NULL, ADD votes_count INT NOT NULL, DROP vote_count, DROP vote_count_ok'
        );
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472B08FA272 FOREIGN KEY (district_id) REFERENCES district (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE594726BF700BD FOREIGN KEY (status_id) REFERENCES status (id)'
        );
        $this->addSql('CREATE INDEX IDX_BFE59472B08FA272 ON proposal (district_id)');
        $this->addSql('CREATE INDEX IDX_BFE594726BF700BD ON proposal (status_id)');
        $this->addSql(
            'ALTER TABLE status ADD step_id INT NOT NULL, ADD position INT NOT NULL, ADD color VARCHAR(255) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE status ADD CONSTRAINT FK_7B00651C73B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_7B00651C73B21E9C ON status (step_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE collect_step_statuses (collect_step_id INT NOT NULL, status_id INT NOT NULL, INDEX IDX_64238CD3330C62D6 (collect_step_id), INDEX IDX_64238CD36BF700BD (status_id), PRIMARY KEY(collect_step_id, status_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE collect_step_statuses ADD CONSTRAINT FK_64238CD3330C62D6 FOREIGN KEY (collect_step_id) REFERENCES step (id)'
        );
        $this->addSql(
            'ALTER TABLE collect_step_statuses ADD CONSTRAINT FK_64238CD36BF700BD FOREIGN KEY (status_id) REFERENCES status (id)'
        );
        $this->addSql('ALTER TABLE argument CHANGE votes_count vote_count INT NOT NULL');
        $this->addSql('ALTER TABLE comment CHANGE votes_count vote_count INT NOT NULL');
        $this->addSql('ALTER TABLE idea CHANGE votes_count vote_count INT NOT NULL');
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472B08FA272');
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE594726BF700BD');
        $this->addSql('DROP INDEX IDX_BFE59472B08FA272 ON proposal');
        $this->addSql('DROP INDEX IDX_BFE594726BF700BD ON proposal');
        $this->addSql(
            'ALTER TABLE proposal ADD vote_count INT NOT NULL, ADD vote_count_ok INT NOT NULL, DROP district_id, DROP status_id, DROP votes_count'
        );
        $this->addSql('ALTER TABLE source CHANGE votes_count vote_count_source INT NOT NULL');
        $this->addSql('ALTER TABLE status DROP FOREIGN KEY FK_7B00651C73B21E9C');
        $this->addSql('DROP INDEX IDX_7B00651C73B21E9C ON status');
        $this->addSql('ALTER TABLE status DROP step_id, DROP position, DROP color');
    }
}
