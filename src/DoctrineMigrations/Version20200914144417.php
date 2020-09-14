<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20200914144417 extends AbstractMigration
{
    private const OLD_VALUE = 'Open Sans, Arial, sans-serif';
    private const NEW_VALUE = 'OpenSans, Arial, sans-serif';

    public function getDescription(): string
    {
        return 'edit Open Sans to OpenSans';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
        $this->addSql(self::generateSQL(self::OLD_VALUE, self::NEW_VALUE));
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
        $this->addSql(self::generateSQL(self::NEW_VALUE, self::OLD_VALUE));
    }

    private static function generateSQL(string $find, string $replace): string
    {
        return 'update font set family_name="' . $replace . '" where family_name="' . $find . '";';
    }
}
