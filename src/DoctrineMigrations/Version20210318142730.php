<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\DoctrineMigrations\IdToUuidMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210318142730 extends IdToUuidMigration
{
    public function getDescription(): string
    {
        return 'migrate debate_anonymous_vote to uuid';
    }

    public function postUp(Schema $schema): void
    {
        $this->migrate('debate_anonymous_vote');
    }
}
