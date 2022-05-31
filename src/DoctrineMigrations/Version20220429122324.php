<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20220429122324 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'ia_category_details and ia_sentiment_details';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE response ADD ia_category_details LONGTEXT DEFAULT NULL, ADD ia_sentiment_details LONGTEXT DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE response DROP ia_category_details, DROP ia_sentiment_details');
    }
}
