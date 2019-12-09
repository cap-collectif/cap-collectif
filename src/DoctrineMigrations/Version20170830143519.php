<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170830143519 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal DROP FOREIGN KEY FK_BFE59472AA334807');
        $this->addSql('DROP INDEX UNIQ_BFE59472AA334807 ON proposal');
        $this->addSql('ALTER TABLE proposal DROP answer_id');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proposal ADD answer_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE proposal ADD CONSTRAINT FK_BFE59472AA334807 FOREIGN KEY (answer_id) REFERENCES answer (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BFE59472AA334807 ON proposal (answer_id)');
    }
}
