<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150320170500 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE idea_vote DROP FOREIGN KEY FK_995930CF94D2D6E1');
        $this->addSql(
            'ALTER TABLE idea_vote ADD message LONGTEXT DEFAULT NULL, ADD confirmed TINYINT(1) NOT NULL, ADD username VARCHAR(255) DEFAULT NULL, ADD email VARCHAR(255) DEFAULT NULL, ADD ip_address VARCHAR(255) DEFAULT NULL, ADD private TINYINT(1) NOT NULL'
        );
        $this->addSql('DROP INDEX idx_995930cf94d2d6e1 ON idea_vote');
        $this->addSql('CREATE INDEX IDX_995930CF5B6FEF7D ON idea_vote (idea_id)');
        $this->addSql(
            'ALTER TABLE idea_vote ADD CONSTRAINT FK_995930CF94D2D6E1 FOREIGN KEY (Idea_id) REFERENCES idea (id)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE idea_vote DROP FOREIGN KEY FK_995930CF5B6FEF7D');
        $this->addSql(
            'ALTER TABLE idea_vote DROP message, DROP confirmed, DROP username, DROP email, DROP ip_address, DROP private'
        );
        $this->addSql('DROP INDEX idx_995930cf5b6fef7d ON idea_vote');
        $this->addSql('CREATE INDEX IDX_995930CF94D2D6E1 ON idea_vote (Idea_id)');
        $this->addSql(
            'ALTER TABLE idea_vote ADD CONSTRAINT FK_995930CF5B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id)'
        );
    }
}
