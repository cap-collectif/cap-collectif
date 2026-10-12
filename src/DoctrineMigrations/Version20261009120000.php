<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261009120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Keep confidential answer attachments private after their response is removed';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            UPDATE media__media m
            INNER JOIN responses_medias rm ON rm.media_id = m.id
            INNER JOIN response r ON r.id = rm.response_id
            INNER JOIN question q ON q.id = r.question_id
            SET m.provider_metadata = JSON_SET(IF(JSON_TYPE(m.provider_metadata) = 'OBJECT', m.provider_metadata, '{}'), '$.private_attachment', '1')
            WHERE r.reply_id IS NOT NULL OR q.private = 1
            SQL);
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException('Removing confidentiality markers could publish orphaned attachments.');
    }
}
