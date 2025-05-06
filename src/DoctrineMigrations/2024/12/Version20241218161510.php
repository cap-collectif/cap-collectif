<?php

declare(strict_types=1);

namespace Capco\DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20241218161510 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update constraint remove anonymous proposal sms vote with user\'s proposal when user hard delete his account';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE anonymous_user_proposal_sms_vote DROP FOREIGN KEY FK_9C8D43D2F4792058');
        $this->addSql('ALTER TABLE anonymous_user_proposal_sms_vote ADD CONSTRAINT FK_9C8D43D2F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE anonymous_user_proposal_sms_vote DROP FOREIGN KEY FK_9C8D43D2F4792058');
        $this->addSql('ALTER TABLE anonymous_user_proposal_sms_vote ADD CONSTRAINT FK_9C8D43D2F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)');
    }
}
