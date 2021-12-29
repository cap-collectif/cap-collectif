<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagMigration;

final class Version20211228180708 extends AbstractFeatureFlagMigration
{
    public function getDescription(): string
    {
        return 'Remove feature flag unstable__analysis';
    }


    protected function getOldFlag(): ?string
    {
        return 'unstable__analysis';
    }

    protected function getNewFlag(): ?string
    {
        return null;
    }
}
