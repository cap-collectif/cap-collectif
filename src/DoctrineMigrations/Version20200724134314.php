<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20200724134314 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'enable map on proposalform using adress';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
        $this->addSql('UPDATE proposal_form SET map_view_enabled=1 WHERE using_address=1');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
        $this->addSql('UPDATE proposal_form SET map_view_enabled=0');
    }
}
