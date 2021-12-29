<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagBetaMigration;

final class Version20211228115215 extends AbstractFeatureFlagBetaMigration
{
    public function getDescription(): string
    {
        return 'beta__emailing';
    }

    protected function getOldFlag(): ?string
    {
        return 'unstable__emailing';
    }
}
