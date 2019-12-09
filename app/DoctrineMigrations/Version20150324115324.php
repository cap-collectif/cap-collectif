<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150324115324 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A63DA5256D');
        $this->addSql('DROP INDEX IDX_964685A63DA5256D ON consultation');
        $this->addSql('ALTER TABLE consultation DROP image_id');
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE consultation ADD image_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A63DA5256D FOREIGN KEY (image_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_964685A63DA5256D ON consultation (image_id)');
    }
}
