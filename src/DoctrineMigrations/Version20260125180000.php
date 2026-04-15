<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260125180000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add http_redirect table for URL management with redirect type discriminator';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("CREATE TABLE http_redirect (id CHAR(36) NOT NULL COMMENT '(DC2Type:guid)', source_url VARCHAR(255) NOT NULL, destination_url LONGTEXT NOT NULL, duration VARCHAR(20) NOT NULL, redirect_type VARCHAR(30) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, UNIQUE INDEX uniq_http_redirect_source (source_url), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE http_redirect');
    }
}
