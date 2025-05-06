<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201221160012 extends AbstractMigration
{
    public function postUp(Schema $schema): void
    {
    }

    public function down(Schema $schema): void
    {
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE project DROP COLUMN opinion_term');
    }
}
