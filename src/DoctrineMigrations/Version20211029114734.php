<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagMigration;

final class Version20211029114734 extends AbstractFeatureFlagMigration
{
    public function getDescription(): string
    {
        return 'transform feature unstable__new_project_card into new_project_card';
    }

    protected function getOldFlag(): ?string
    {
        return 'unstable__new_project_card';
    }

    protected function getNewFlag(): ?string
    {
        return 'new_project_card';
    }
}
