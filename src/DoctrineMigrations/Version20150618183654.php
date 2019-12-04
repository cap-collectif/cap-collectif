<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150618183654 extends AbstractMigration
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

        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACFF8697D13');
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFF8697D13 FOREIGN KEY (comment_id) REFERENCES comment (id)'
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

        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACFF8697D13');
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFF8697D13 FOREIGN KEY (comment_id) REFERENCES comment (id) ON DELETE CASCADE'
        );
    }
}
