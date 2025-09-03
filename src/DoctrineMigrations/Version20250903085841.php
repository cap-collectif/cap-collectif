<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250903085841 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Delete CONSENT_PRIVACY_POLICY in steps excluding collect/selection/questionnaire';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("DELETE requirement FROM requirement JOIN step s ON s.id = requirement.step_id AND requirement.type = 'CONSENT_PRIVACY_POLICY' WHERE s.step_type NOT IN ('selection', 'collect', 'questionnaire')");
    }

    public function down(Schema $schema): void
    {
    }
}
