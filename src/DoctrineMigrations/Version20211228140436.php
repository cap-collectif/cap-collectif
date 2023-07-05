<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211228140436 extends AbstractFeatureFlagMigration
{
    public function getDescription(): string
    {
        return 'Remove feature flag unstable__debate';
    }

    protected function getOldFlag(): ?string
    {
        return 'unstable__debate';
    }

    protected function getNewFlag(): ?string
    {
        return null;
    }
}
