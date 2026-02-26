<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260211113000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add post_logout_redirect_uri to sso_configuration';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE sso_configuration ADD post_logout_redirect_uri LONGTEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE sso_configuration DROP post_logout_redirect_uri');
    }
}
