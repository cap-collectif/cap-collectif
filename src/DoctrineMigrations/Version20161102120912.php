<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20161102120912 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE proposal ADD service_pilote LONGTEXT DEFAULT NULL, ADD domaniality LONGTEXT DEFAULT NULL, ADD compatibility LONGTEXT DEFAULT NULL, ADD environmental_impact LONGTEXT DEFAULT NULL, ADD dimension LONGTEXT DEFAULT NULL, ADD functioning_impact LONGTEXT DEFAULT NULL, ADD evaluation LONGTEXT DEFAULT NULL, ADD delay LONGTEXT DEFAULT NULL, ADD proposed_answer LONGTEXT DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE proposal DROP service_pilote, DROP domaniality, DROP compatibility, DROP environmental_impact, DROP dimension, DROP functioning_impact, DROP evaluation, DROP delay, DROP proposed_answer'
        );
    }
}
