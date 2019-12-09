<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

class Version20170901153517 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql(
            'ALTER TABLE proposal_form ADD require_proposal_in_a_zone TINYINT(1) NOT NULL'
        );
        $this->addSql(
            'ALTER TABLE district ADD geojson LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:json)\', ADD display_on_map TINYINT(1) NOT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE district DROP geojson, DROP display_on_map');
        $this->addSql('ALTER TABLE proposal_form DROP require_proposal_in_a_zone');
    }
}
