<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20241107093542 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fix internal and external communication consent and date of confirmation email';
    }

    public function up(Schema $schema): void
    {
        // If user has no email (was soft deleted for example), some fields should have default values.
        $this->addSql('
            update fos_user
            set consent_internal_communication = 0, consent_external_communication = 0, email_confirmation_sent_at = null
                where email is null
        ');

        // Consider as SENT old emailing campaigns that never ended.
        $this->addSql("
            update emailing_campaign
            set status = 'SENT'
            where status = 'SENDING'
            and send_at < (CURRENT_DATE() - INTERVAL 1 DAY)
        ");
    }

    public function down(Schema $schema): void
    {
        // Nothing to do, data cannot be retrieved.
    }
}
