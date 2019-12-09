<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170911113809 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE consultation_step_type DROP FOREIGN KEY FK_64BADC9F73B21E9C');
        $this->addSql(
            'ALTER TABLE consultation_step_type ADD CONSTRAINT FK_64BADC9F73B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE SET NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE consultation_step_type DROP FOREIGN KEY FK_64BADC9F73B21E9C');
        $this->addSql(
            'ALTER TABLE consultation_step_type ADD CONSTRAINT FK_64BADC9F73B21E9C FOREIGN KEY (step_id) REFERENCES step (id)'
        );
    }
}
