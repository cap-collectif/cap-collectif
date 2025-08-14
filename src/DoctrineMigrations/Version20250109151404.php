<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250109151404 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add consent privacy policy to participant & user';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fos_user ADD consent_privacy_policy TINYINT(1) NOT NULL DEFAULT \'0\'');
        $this->addSql('ALTER TABLE participant ADD consent_privacy_policy TINYINT(1) NOT NULL DEFAULT \'0\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fos_user DROP consent_privacy_policy');
        $this->addSql('ALTER TABLE participant DROP consent_privacy_policy');
    }
}
