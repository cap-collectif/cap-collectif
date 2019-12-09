<?php
declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20180726142832 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE opinion DROP validated');
        $this->addSql('ALTER TABLE source DROP validated');
        $this->addSql('ALTER TABLE argument DROP validated');
        $this->addSql(
            'ALTER TABLE opinion_version DROP validated, CHANGE updated_at updated_at DATETIME DEFAULT NULL'
        );
        $this->addSql('ALTER TABLE comment DROP validated');
    }

    public function down(Schema $schema): void
    {
    }
}
