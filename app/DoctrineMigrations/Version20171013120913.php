<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171013120913 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E834F9F76D25');
        $this->addSql(
            'ALTER TABLE proposal_form CHANGE notification_configuration_id notification_configuration_id INT NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E834F9F76D25 FOREIGN KEY (notification_configuration_id) REFERENCES notifications_configuration (id)'
        );
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BA5AE01D989D9B62 ON blog_post (slug)');
    }

    public function down(Schema $schema)
    {
        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E834F9F76D25');
        $this->addSql(
            'ALTER TABLE proposal_form CHANGE notification_configuration_id notification_configuration_id INT DEFAULT NULL'
        );
        $this->addSql('DROP INDEX UNIQ_BA5AE01D989D9B62 ON blog_post');
    }
}
