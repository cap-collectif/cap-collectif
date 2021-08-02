<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210802073511 extends AbstractMigration
{
    public function getDescription() : string
    {
        return 'Since synthesis step is no longer used we update `synthesis` step_type into `other` ';
    }

    public function up(Schema $schema) : void
    {
        $this->addSql("UPDATE step SET step_type = 'other' WHERE step_type = 'synthesis'");
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
