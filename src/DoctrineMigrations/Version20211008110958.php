<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211008110958 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'fos_user.identification_code';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE fos_user ADD identification_code VARCHAR(255) DEFAULT NULL');
        $this->addSql(
            'CREATE UNIQUE INDEX UNIQ_957A64799E80DE4C ON fos_user (identification_code)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_957A64799E80DE4C ON fos_user');
        $this->addSql('ALTER TABLE fos_user DROP identification_code');
    }
}
