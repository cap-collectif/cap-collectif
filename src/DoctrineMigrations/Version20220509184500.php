<?php

declare(strict_types=1);

namespace Application\Migrations;

use CapCollectif\IdToUuid\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

final class Version20220509184500 extends IdToUuidMigration
{
    public function getDescription(): string
    {
        return 'remove facebook_XXX as email';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $q = $this->connection->prepare(
            'UPDATE fos_user SET email = null WHERE email LIKE "facebook_%"'
        );
        $q->executeQuery();
    }
}
