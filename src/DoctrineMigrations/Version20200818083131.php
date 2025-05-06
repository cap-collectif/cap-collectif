<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200818083131 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE opinion DROP vote_count_nok, DROP vote_count_ok, DROP vote_count_mitige'
        );
        $this->addSql(
            'ALTER TABLE opinion_version DROP sources_count, DROP arguments_count, DROP vote_count_nok, DROP vote_count_ok, DROP vote_count_mitige'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE opinion ADD vote_count_nok INT NOT NULL, ADD vote_count_ok INT NOT NULL, ADD vote_count_mitige INT NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE opinion_version ADD sources_count INT NOT NULL, ADD arguments_count INT NOT NULL, ADD vote_count_nok INT NOT NULL, ADD vote_count_ok INT NOT NULL, ADD vote_count_mitige INT NOT NULL'
        );
    }
}
