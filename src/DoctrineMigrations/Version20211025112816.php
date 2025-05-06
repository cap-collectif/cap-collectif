<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20211025112816 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'mailing_list.project_id on delete set null';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE mailing_list DROP FOREIGN KEY FK_15C473AF166D1F9C');
        $this->addSql(
            'ALTER TABLE mailing_list ADD CONSTRAINT FK_15C473AF166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE SET NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE mailing_list DROP FOREIGN KEY FK_15C473AF166D1F9C');
        $this->addSql(
            'ALTER TABLE mailing_list ADD CONSTRAINT FK_15C473AF166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)'
        );
    }
}
