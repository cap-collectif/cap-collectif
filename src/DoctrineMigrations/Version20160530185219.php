<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160530185219 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema):void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE questionnaire DROP FOREIGN KEY FK_7A64DAF73B21E9C');
        $this->addSql(
            'ALTER TABLE questionnaire ADD CONSTRAINT FK_7A64DAF73B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE SET NULL'
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema):void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE questionnaire DROP FOREIGN KEY FK_7A64DAF73B21E9C');
        $this->addSql(
            'ALTER TABLE questionnaire ADD CONSTRAINT FK_7A64DAF73B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE CASCADE'
        );
    }
}
