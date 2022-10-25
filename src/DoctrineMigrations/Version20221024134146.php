<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20221024134146 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'section_project.project on delete cascade';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section_project DROP FOREIGN KEY FK_FDF41DE1166D1F9C');
        $this->addSql(
            'ALTER TABLE section_project ADD CONSTRAINT FK_FDF41DE1166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section_project DROP FOREIGN KEY FK_FDF41DE1166D1F9C');
        $this->addSql(
            'ALTER TABLE section_project ADD CONSTRAINT FK_FDF41DE1166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)'
        );
    }
}
