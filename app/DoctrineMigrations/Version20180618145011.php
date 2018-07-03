<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20180618145011 extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        if(!$schema->getTable('fos_user')->hasColumn('locked')) {
            $this->addSql('ALTER TABLE fos_user ADD locked TINYINT(1) NOT NULL');
        }
        if(!$schema->getTable('fos_user')->hasColumn('expired')) {
            $this->addSql('ALTER TABLE fos_user ADD expired TINYINT(1) NOT NULL');
        }
        if(!$schema->getTable('fos_user')->hasColumn('expires_at')) {
            $this->addSql('ALTER TABLE fos_user ADD expires_at DATETIME DEFAULT NULL');
        }
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        if($schema->getTable('fos_user')->hasColumn('locked')) {
            $this->addSql('ALTER TABLE fos_user DROP locked');
        }
        if($schema->getTable('fos_user')->hasColumn('expired')) {
            $this->addSql('ALTER TABLE fos_user DROP expired');
        }
        if($schema->getTable('fos_user')->hasColumn('expires_at')) {
            $this->addSql('ALTER TABLE fos_user DROP expires_at');
        }
    }
}
