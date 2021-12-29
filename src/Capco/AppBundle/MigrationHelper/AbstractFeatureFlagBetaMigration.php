<?php

namespace Capco\AppBundle\MigrationHelper;

abstract class AbstractFeatureFlagBetaMigration extends AbstractFeatureFlagMigration
{
    protected function getNewFlag(): ?string
    {
        return str_replace('unstable__', 'beta__', $this->getOldFlag());
    }
}
