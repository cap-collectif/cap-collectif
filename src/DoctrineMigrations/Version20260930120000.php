<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260930120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Align custom code version indexes with Doctrine mapping';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('DROP INDEX IDX_8F11118BA31E9F89 ON custom_code_version');
        $this->addSql('ALTER TABLE custom_code_version DROP FOREIGN KEY FK_8F11118B71E8C3F3');
        $this->addSql('DROP INDEX IDX_8F11118B71E8C3F3 ON custom_code_version');
        $this->addSql('CREATE INDEX IDX_FC3C80444B4B87F ON custom_code_version (restored_from_version_id)');
        $this->addSql('ALTER TABLE custom_code_version ADD CONSTRAINT FK_8F11118B71E8C3F3 FOREIGN KEY (restored_from_version_id) REFERENCES custom_code_version (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE custom_code_version DROP FOREIGN KEY FK_8F11118B71E8C3F3');
        $this->addSql('DROP INDEX IDX_FC3C80444B4B87F ON custom_code_version');
        $this->addSql('CREATE INDEX IDX_8F11118B71E8C3F3 ON custom_code_version (restored_from_version_id)');
        $this->addSql('ALTER TABLE custom_code_version ADD CONSTRAINT FK_8F11118B71E8C3F3 FOREIGN KEY (restored_from_version_id) REFERENCES custom_code_version (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_8F11118BA31E9F89 ON custom_code_version (created_by_user_id)');
    }
}
