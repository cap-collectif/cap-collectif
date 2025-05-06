<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220419175614 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'deplace civicIA from reply to response';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE reply DROP ia_category, DROP ia_readability, DROP ia_sentiment');
        $this->addSql(
            'ALTER TABLE reply_anonymous DROP ia_category, DROP ia_readability, DROP ia_sentiment'
        );
        $this->addSql(
            'ALTER TABLE response ADD ia_category LONGTEXT DEFAULT NULL, ADD ia_readability INT DEFAULT NULL, ADD ia_sentiment LONGTEXT DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE reply ADD ia_category LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD ia_readability INT DEFAULT NULL, ADD ia_sentiment LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
        $this->addSql(
            'ALTER TABLE reply_anonymous ADD ia_category LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`, ADD ia_readability INT DEFAULT NULL, ADD ia_sentiment LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
        $this->addSql(
            'ALTER TABLE response DROP ia_category, DROP ia_readability, DROP ia_sentiment'
        );
    }
}
