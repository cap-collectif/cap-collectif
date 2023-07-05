<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220606113216 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'fos_user.openid_sessions_id';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE fos_user SET openid_sessions_id = \'a:0:{}\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
