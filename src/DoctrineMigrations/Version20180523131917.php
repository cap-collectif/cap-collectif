<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20180523131917 extends AbstractMigration
{
    public function up(Schema $schema): void{
        $this->addSql(
            'CREATE TABLE user_archive (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', requested_at DATETIME NOT NULL, is_generated TINYINT(1) NOT NULL, deleted_at DATETIME DEFAULT NULL, path LONGTEXT DEFAULT NULL, INDEX IDX_8DF14396A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE user_archive ADD CONSTRAINT FK_8DF14396A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)'
        );
    }

    public function down(Schema $schema): void{
    }
}
