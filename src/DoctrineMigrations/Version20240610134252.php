<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240610134252 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'migrate extra presentation step to other step';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("update step set start_at = null, end_at = null, step_type = 'other', timeless = 1 where id in (
                        select s.id
                        from step s
                        join project_abstractstep pas on s.id = pas.step_id
                        where s.step_type = 'presentation' and pas.position > 1
        )");
    }

    public function down(Schema $schema): void
    {
    }
}
