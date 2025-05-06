<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20211122220652 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'fos_user.user_identification_code ON DELETE SET NULL';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fos_user DROP FOREIGN KEY FK_957A6479B443B13E');
        $this->addSql(
            'ALTER TABLE fos_user ADD CONSTRAINT FK_957A6479B443B13E FOREIGN KEY (user_identification_code) REFERENCES user_identification_code (identification_code) ON DELETE SET NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fos_user DROP FOREIGN KEY FK_957A6479B443B13E');
        $this->addSql(
            'ALTER TABLE fos_user ADD CONSTRAINT FK_957A6479B443B13E FOREIGN KEY (user_identification_code) REFERENCES user_identification_code (identification_code)'
        );
    }
}
