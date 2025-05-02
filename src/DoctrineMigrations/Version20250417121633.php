<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250417121633 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update establishment to proposal';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("UPDATE proposal_form SET object_type = 'proposal' WHERE object_type = 'establishment'");
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException();
    }
}
