<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211228120954 extends AbstractFeatureFlagMigration
{
    public function getDescription(): string
    {
        return 'Remove feature flag majority_vote_question';
    }

    protected function getOldFlag(): ?string
    {
        return 'majority_vote_question';
    }

    protected function getNewFlag(): ?string
    {
        return null;
    }
}
