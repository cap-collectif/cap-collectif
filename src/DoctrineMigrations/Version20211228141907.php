<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagBetaMigration;

final class Version20211228141907 extends AbstractFeatureFlagBetaMigration
{
    public function getDescription(): string
    {
        return 'beta__admin_editor';
    }

    protected function getOldFlag(): ?string
    {
        return 'unstable__admin_editor';
    }
}
