<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171122174627 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(
            'CREATE TABLE user_evaluatin_proposal (proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', group_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_927234D1F4792058 (proposal_id), INDEX IDX_927234D1FE54D947 (group_id), PRIMARY KEY(proposal_id, group_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE user_evaluatin_proposal ADD CONSTRAINT FK_927234D1F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE user_evaluatin_proposal ADD CONSTRAINT FK_927234D1FE54D947 FOREIGN KEY (group_id) REFERENCES user_group (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE user_evaluatin_proposal');
    }
}
