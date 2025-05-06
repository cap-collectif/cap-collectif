<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagMigration;

final class Version20200820094734 extends AbstractFeatureFlagMigration
{
    public function getDescription(): string
    {
        return 'transform feature unstable__multilangue into multilangue';
    }

    protected function getOldFlag(): ?string
    {
        return 'unstable__multilangue';
    }

    protected function getNewFlag(): ?string
    {
        return 'multilangue';
    }
}
