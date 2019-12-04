<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20151027203030 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void{
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE collect_step_statuses (collect_step_id INT NOT NULL, status_id INT NOT NULL, INDEX IDX_64238CD3330C62D6 (collect_step_id), INDEX IDX_64238CD36BF700BD (status_id), PRIMARY KEY(collect_step_id, status_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE collect_step_statuses ADD CONSTRAINT FK_64238CD3330C62D6 FOREIGN KEY (collect_step_id) REFERENCES step (id)'
        );
        $this->addSql(
            'ALTER TABLE collect_step_statuses ADD CONSTRAINT FK_64238CD36BF700BD FOREIGN KEY (status_id) REFERENCES status (id)'
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void{
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE collect_step_statuses');
    }
}
