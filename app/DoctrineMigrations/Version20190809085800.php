<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190809085800 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE consultation ADD position INT NOT NULL, DROP INDEX UNIQ_964685A673B21E9C, ADD INDEX IDX_964685A673B21E9C (step_id)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX consultation_position_unique ON consultation (step_id, position)'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE consultation DROP position, DROP INDEX IDX_964685A673B21E9C, ADD UNIQUE INDEX UNIQ_964685A673B21E9C (step_id)'
        );
        $this->addSql('DROP INDEX consultation_position_unique ON consultation');
    }
}
