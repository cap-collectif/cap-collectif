<?php

declare(strict_types=1);

namespace Capco\DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240201091818 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'rename project district by global';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE district SET district_type = \'global\' WHERE district_type = \'project\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('UPDATE district SET district_type = \'project\' WHERE district_type = \'global\'');
    }
}
