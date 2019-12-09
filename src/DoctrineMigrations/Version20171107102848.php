<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20171107102848 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(
            'CREATE TABLE user_in_group (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', group_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_C7B8BEBBA76ED395 (user_id), INDEX IDX_C7B8BEBBFE54D947 (group_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE user_group (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', created_by CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', updated_by CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', description LONGTEXT, updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, INDEX IDX_8F02BF9DDE12AB56 (created_by), INDEX IDX_8F02BF9D16FE72E1 (updated_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE user_in_group ADD CONSTRAINT FK_C7B8BEBBA76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE user_in_group ADD CONSTRAINT FK_C7B8BEBBFE54D947 FOREIGN KEY (group_id) REFERENCES user_group (id)'
        );
        $this->addSql(
            'ALTER TABLE user_group ADD CONSTRAINT FK_8F02BF9DDE12AB56 FOREIGN KEY (created_by) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE user_group ADD CONSTRAINT FK_8F02BF9D16FE72E1 FOREIGN KEY (updated_by) REFERENCES fos_user (id)'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user_in_group DROP FOREIGN KEY FK_C7B8BEBBFE54D947');
        $this->addSql('DROP TABLE user_in_group');
        $this->addSql('DROP TABLE user_group');
    }
}
