<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20201123105240 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'mailingList.created_at';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE mailing_list ADD created_at DATETIME NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE mailing_list DROP created_at');
    }

    public function postUp(Schema $schema): void
    {
        $this->connection->executeQuery('UPDATE mailing_list SET created_at = ?', [
            (new \DateTime())->format('Y-m-d H:i:s'),
        ]);
    }
}
