<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151112110533 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACFF8697D13');
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFF8697D13 FOREIGN KEY (comment_id) REFERENCES comment (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE opinion_version DROP FOREIGN KEY FK_52AD19DD727ACA70');
        $this->addSql('DROP INDEX IDX_52AD19DD727ACA70 ON opinion_version');
        $this->addSql('ALTER TABLE opinion_version CHANGE parent_id opinion_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE opinion_version ADD CONSTRAINT FK_52AD19DD51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_52AD19DD51885A6A ON opinion_version (opinion_id)');
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B027AA334807');
        $this->addSql(
            'ALTER TABLE opinion ADD CONSTRAINT FK_AB02B027AA334807 FOREIGN KEY (answer_id) REFERENCES answer (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472AA334807');
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472AA334807 FOREIGN KEY (answer_id) REFERENCES answer (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE opinion_version DROP FOREIGN KEY FK_52AD19DDAA334807');
        $this->addSql(
            'ALTER TABLE opinion_version ADD CONSTRAINT FK_52AD19DDAA334807 FOREIGN KEY (answer_id) REFERENCES answer (id) ON DELETE SET NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE opinion_version DROP FOREIGN KEY FK_52AD19DD51885A6A');
        $this->addSql('DROP INDEX IDX_52AD19DD51885A6A ON opinion_version');
        $this->addSql('ALTER TABLE opinion_version CHANGE opinion_id parent_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE opinion_version ADD CONSTRAINT FK_52AD19DD727ACA70 FOREIGN KEY (parent_id) REFERENCES opinion (id)'
        );
        $this->addSql('CREATE INDEX IDX_52AD19DD727ACA70 ON opinion_version (parent_id)');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACFF8697D13');
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFF8697D13 FOREIGN KEY (comment_id) REFERENCES comment (id)'
        );
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B027AA334807');
        $this->addSql(
            'ALTER TABLE opinion ADD CONSTRAINT FK_AB02B027AA334807 FOREIGN KEY (answer_id) REFERENCES answer (id)'
        );
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472AA334807');
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472AA334807 FOREIGN KEY (answer_id) REFERENCES answer (id)'
        );
        $this->addSql('ALTER TABLE opinion_version DROP FOREIGN KEY FK_52AD19DDAA334807');
        $this->addSql(
            'ALTER TABLE opinion_version ADD CONSTRAINT FK_52AD19DDAA334807 FOREIGN KEY (answer_id) REFERENCES answer (id)'
        );
    }
}
