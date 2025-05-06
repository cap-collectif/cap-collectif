<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20221205145831 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'INSERT LOCALE RECETTE';
    }

    public function up(Schema $schema): void
    {
        $this->connection->insert('locale', [
            'id' => 'locale-ur-IN',
            'traduction_key' => 'recette',
            'code' => 'ur-IN',
            'is_enabled' => 0,
            'is_published' => 0,
            'is_default' => 0,
        ]);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
