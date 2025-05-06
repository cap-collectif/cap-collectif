<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220609154539 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'response_stars';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'CREATE TABLE response_stars (response_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_116B1B7CFBF32840 (response_id), INDEX IDX_116B1B7CA76ED395 (user_id), PRIMARY KEY(response_id, user_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE response_stars ADD CONSTRAINT FK_59BC952DFBF32840 FOREIGN KEY (response_id) REFERENCES response (id)'
        );
        $this->addSql(
            'ALTER TABLE response_stars ADD CONSTRAINT FK_59BC952DA76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE response_stars');
    }
}
