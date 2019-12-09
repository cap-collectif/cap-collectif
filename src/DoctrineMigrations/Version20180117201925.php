<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20180117201925 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE progress_step DROP FOREIGN KEY FK_4330D1F5F4792058');
        $this->addSql(
            'ALTER TABLE progress_step ADD CONSTRAINT FK_4330D1F5F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE progress_step DROP FOREIGN KEY FK_4330D1F5F4792058');
        $this->addSql(
            'ALTER TABLE progress_step ADD CONSTRAINT FK_4330D1F5F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
    }
}
