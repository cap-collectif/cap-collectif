<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171013120913 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('ALTER TABLE proposal_form CHANGE notification_configuration_id notification_configuration_id INT NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BA5AE01D989D9B62 ON blog_post (slug)');
    }

    public function down(Schema $schema)
    {
        $this->addSql('ALTER TABLE proposal_form CHANGE notification_configuration_id notification_configuration_id INT DEFAULT NULL');
        $this->addSql('DROP INDEX UNIQ_BA5AE01D989D9B62 ON blog_post');
    }
}
