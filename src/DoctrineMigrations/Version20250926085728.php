<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250926085728 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Convert all columns to utf8mb4 for the whole database.';
    }

    public function up(Schema $schema): void
    {
        $this->updateColumnCharset('utf8mb4', 'utf8mb4_unicode_ci');
    }

    public function down(Schema $schema): void
    {
        $this->updateColumnCharset();
    }

    private function updateColumnCharset(string $charset = 'utf8', string $charsetCollate = 'utf8_unicode_ci'): void
    {
        $schemaManager = $this->connection->getSchemaManager();

        $this->addSql('SET FOREIGN_KEY_CHECKS=0');

        foreach ($schemaManager->listTableNames() as $tableName) {
            $this->addSql(sprintf(
                'ALTER TABLE `%s` CONVERT TO CHARACTER SET `%s` COLLATE `%s`',
                $tableName,
                $charset,
                $charsetCollate
            ));
        }

        $this->addSql('SET FOREIGN_KEY_CHECKS=1');
    }
}
