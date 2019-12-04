<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20180220205853 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fos_user ADD paris_id VARCHAR(255) DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957A6479A162E52 ON fos_user (saml_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957A6479D6F1A30E ON fos_user (paris_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_957A6479A162E52 ON fos_user');
        $this->addSql('DROP INDEX UNIQ_957A6479D6F1A30E ON fos_user');
        $this->addSql('ALTER TABLE fos_user DROP paris_id');
    }
}
