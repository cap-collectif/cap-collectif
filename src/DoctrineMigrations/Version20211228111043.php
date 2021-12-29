<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagBetaMigration;

final class Version20211228111043 extends AbstractFeatureFlagBetaMigration
{
    public function getDescription(): string
    {
        return 'beta__analytics_page';
    }

    protected function getOldFlag(): ?string
    {
        return 'unstable__analytics_page';
    }
}
