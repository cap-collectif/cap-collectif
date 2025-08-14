<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250311132930 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'migrate anonymous votes';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('create index votes__index__phone on votes (phone)');
        $this->addSql('create index participant__index__phone on participant (phone)');

        $this->addSql('INSERT INTO participant (id, phone, phone_confirmed, token, created_at, last_contributed_at)
                            SELECT uuid(),
                                   phone,
                                   true,
                                   uuid(),
                                   created_at,
                                   created_at
                            FROM (SELECT DISTINCT phone, created_at
                                  FROM votes
                                  WHERE phone IS NOT NULL) AS unique_phones');

        $this->addSql('UPDATE votes v
            JOIN participant p ON v.phone = p.phone AND v.phone IS NOT NULL
            SET v.participant_id = p.id
            ');

        $this->addSql("UPDATE votes v SET voteType = 'proposalSelection' WHERE voteType = 'proposalSelectionSms'");
        $this->addSql("UPDATE votes v SET voteType = 'proposalCollect' WHERE voteType = 'proposalCollectSms'");

        $this->addSql('drop index votes__index__phone on votes');
        $this->addSql('drop index participant__index__phone on participant');
    }

    public function down(Schema $schema): void
    {
    }
}
