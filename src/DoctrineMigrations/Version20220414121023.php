<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220414121023 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'civicIA';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE reply ADD ia_category LONGTEXT DEFAULT NULL, ADD ia_readability INT DEFAULT NULL, ADD ia_sentiment LONGTEXT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE reply_anonymous ADD ia_category LONGTEXT DEFAULT NULL, ADD ia_readability INT DEFAULT NULL, ADD ia_sentiment LONGTEXT DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE reply DROP ia_category, DROP ia_readability, DROP ia_sentiment');
        $this->addSql(
            'ALTER TABLE reply_anonymous DROP ia_category, DROP ia_readability, DROP ia_sentiment'
        );
    }
}
