<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Enum\AvailableProposalCategoryColor;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201104151449 extends AbstractMigration
{
    public function getDescription() : string
    {
        return 'Setting default color for proposal categories';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->connection->executeQuery('UPDATE proposal_category SET color = ? WHERE color IS NULL OR color = ""', [AvailableProposalCategoryColor::COLOR_1E88E5]);
    }

    public function down(Schema $schema): void
    {

    }

}
