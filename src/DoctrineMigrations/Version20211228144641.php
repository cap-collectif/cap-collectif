<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211228144641 extends AbstractFeatureFlagMigration
{
    public function getDescription(): string
    {
        return 'Remove feature flag app_news';
    }

    protected function getOldFlag(): ?string
    {
        return 'app_news';
    }

    protected function getNewFlag(): ?string
    {
        return null;
    }
}
