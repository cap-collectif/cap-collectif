<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20200121114505 extends AbstractMigration
{
    public function getDescription() : string
    {
        return 'Set post body as nullable';
    }

    public function up(Schema $schema) : void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE blog_post_translation CHANGE body body LONGTEXT DEFAULT NULL');

    }

    public function down(Schema $schema) : void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );
        $this->addSql('ALTER TABLE blog_post_translation CHANGE body body LONGTEXT CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci`');
    }
}
