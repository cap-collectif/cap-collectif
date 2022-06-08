<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220603113215 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'fos_user.openid_sessions_id';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE fos_user ADD openid_sessions_id LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:array)\''
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE fos_user DROP openid_sessions_id');
    }
}
