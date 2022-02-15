<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220214151310 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'reply_anonymous.email_confirmed';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE reply_anonymous ADD email_confirmed TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE reply_anonymous DROP email_confirmed');
    }
}
