<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260519093844 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'set consent_privacy_policy to true';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE fos_user set consent_privacy_policy = 1');
    }

    public function down(Schema $schema): void
    {
    }
}
