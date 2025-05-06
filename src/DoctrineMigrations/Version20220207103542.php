<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\MigrationHelper\AbstractFeatureFlagMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220207103542 extends AbstractFeatureFlagMigration
{
    public function getDescription(): string
    {
        return 'transform disconnect_openid into oauth2_switch_user';
    }

    protected function getOldFlag(): ?string
    {
        return 'disconnect_openid';
    }

    protected function getNewFlag(): ?string
    {
        return 'oauth2_switch_user';
    }
}
