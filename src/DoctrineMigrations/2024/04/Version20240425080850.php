<?php

declare(strict_types=1);

namespace Capco\DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240425080850 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add sub_type to step';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE step ADD sub_type VARCHAR(255) DEFAULT NULL');
        $this->addSql("UPDATE step set sub_type = 'VOTE' WHERE step_type = 'selection'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE step DROP sub_type');
    }
}
