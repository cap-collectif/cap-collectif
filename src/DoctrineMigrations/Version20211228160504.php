<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagMigration;

final class Version20211228160504 extends AbstractFeatureFlagMigration
{
    public function getDescription(): string
    {
        return 'unstable__anonymous_questionnaire';
    }

    protected function getOldFlag(): ?string
    {
        return 'unstable_anonymous_questionnaire';
    }

    protected function getNewFlag(): ?string
    {
        return 'unstable__anonymous_questionnaire';
    }
}
