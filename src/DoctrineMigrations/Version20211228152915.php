<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagMigration;

final class Version20211228152915 extends AbstractFeatureFlagMigration
{
    public function getDescription(): string
    {
        return 'unstable__project_admin';
    }

    protected function getOldFlag(): ?string
    {
        return 'unstable_project_admin';
    }

    protected function getNewFlag(): ?string
    {
        return 'unstable__project_admin';
    }
}
