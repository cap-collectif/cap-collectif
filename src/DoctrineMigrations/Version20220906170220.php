<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220906170220 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'DROP fos_user.paris_id';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_957A6479D6F1A30E ON fos_user');
        $this->addSql('ALTER TABLE fos_user DROP paris_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE fos_user ADD paris_id VARCHAR(255) CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957A6479D6F1A30E ON fos_user (paris_id)');
    }
}
