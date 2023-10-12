<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20230825134623 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add DELETE CASCADE opinion_type on opinion';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B02728FD468D');
        $this->addSql('ALTER TABLE opinion ADD CONSTRAINT FK_AB02B02728FD468D FOREIGN KEY (opinion_type_id) REFERENCES opinion_type (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B02728FD468D');
        $this->addSql('ALTER TABLE opinion ADD CONSTRAINT FK_AB02B02728FD468D FOREIGN KEY (opinion_type_id) REFERENCES opinion_type (id)');
    }
}
