<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210429170348 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'ActionToken';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'CREATE TABLE action_token (token VARCHAR(255) NOT NULL, user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', action VARCHAR(255) NOT NULL, consumption_date DATETIME DEFAULT NULL, INDEX IDX_B8F96D87A76ED395 (user_id), UNIQUE INDEX action_token_unique (action, user_id), PRIMARY KEY(token)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE action_token ADD CONSTRAINT FK_B8F96D87A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE action_token');
    }
}
