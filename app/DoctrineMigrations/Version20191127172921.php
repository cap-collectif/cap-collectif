<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191127172921 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE locale (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', traduction_key VARCHAR(255) NOT NULL, code VARCHAR(8) NOT NULL, is_enabled TINYINT(1) NOT NULL, is_published TINYINT(1) NOT NULL, is_default TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_4180C698D18F3586 (traduction_key), UNIQUE INDEX UNIQ_4180C69877153098 (code), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE locale');
    }
}
