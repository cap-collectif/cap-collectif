<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220927094811 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'section.center';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section ADD center_latitude DOUBLE PRECISION DEFAULT NULL, ADD center_longitude DOUBLE PRECISION DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section DROP center_latitude, DROP center_longitude');
    }
}
