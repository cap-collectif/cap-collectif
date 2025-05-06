<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20241216162334 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove multiple registrations to the same event for 1 user. Keep only the most recent.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('
            delete
            from event_registration
            where id not in (select er.id
                             from event_registration er
                                      inner join (select event_id, user_id, MAX(created_at) as created_at
                                                  from event_registration
                                                  where user_id is not null
                                                  group by event_id, user_id) as max using (event_id, user_id, created_at)
                             union
                             select id
                             from event_registration
                             where user_id is null
                     );
        ');
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException('Deleted data cannot be reversed.');
    }
}
