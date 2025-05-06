<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagMigration;

final class Version20211228150301 extends AbstractFeatureFlagMigration
{
    public function getDescription(): string
    {
        return 'beta_questionnaire_result';
    }

    protected function getOldFlag(): ?string
    {
        return 'new_feature_questionnaire_result';
    }

    protected function getNewFlag(): ?string
    {
        return 'beta_questionnaire_result';
    }
}
