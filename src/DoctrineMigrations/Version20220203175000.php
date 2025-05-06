<?php

namespace Capco\DoctrineMigrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagMigration;

class Version20220203175000 extends AbstractFeatureFlagMigration
{
    public function getDescription(): string
    {
        return 'beta__questionnaire_result';
    }

    protected function getOldFlag(): ?string
    {
        return 'beta_questionnaire_result';
    }

    protected function getNewFlag(): ?string
    {
        return 'beta__questionnaire_result';
    }
}
