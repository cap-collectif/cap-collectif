<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250926085728 extends AbstractMigration
{
    private const CHARSET_COMPATIBLE_TYPES = [
        'string',
        'text',
        'guid',
        'json',
    ];

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

        $platform = $this->connection->getDatabasePlatform();

        $this->addSql('SET FOREIGN_KEY_CHECKS=0');

        foreach ($schemaManager->listTableNames() as $tableName) {
            $columns = $schemaManager->listTableColumns($tableName);

            foreach ($columns as $column) {
                $type = $column->getType()->getName();

                if (!\in_array($type, self::CHARSET_COMPATIBLE_TYPES, true)) {
                    continue;
                }

                $sqlType = $column->getType()->getSQLDeclaration($column->toArray(), $platform);

                $this->addSql(sprintf(
                    'ALTER TABLE `%s` MODIFY `%s` %s CHARACTER SET `%s` COLLATE `%s`',
                    $tableName,
                    $column->getName(),
                    $sqlType,
                    $charset,
                    $charsetCollate
                ));
            }
        }

        $this->addSql('SET FOREIGN_KEY_CHECKS=1');
    }
}
