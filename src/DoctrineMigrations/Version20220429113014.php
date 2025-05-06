<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220429113014 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'ia_readability as float';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE response CHANGE ia_readability ia_readability DOUBLE PRECISION DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE response CHANGE ia_readability ia_readability INT DEFAULT NULL');
    }
}
