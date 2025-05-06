<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagBetaMigration;

final class Version20211228115216 extends AbstractFeatureFlagBetaMigration
{
    public function getDescription(): string
    {
        return 'beta__emailing_parameters';
    }

    protected function getOldFlag(): ?string
    {
        return 'unstable__emailing_parameters';
    }
}
