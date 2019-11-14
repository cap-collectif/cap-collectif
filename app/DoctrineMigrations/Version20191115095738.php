<?php declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191115095738 extends AbstractMigration
{

    public function up(Schema $schema) : void
    {
        $this->addSql('ALTER TABLE source ADD CONSTRAINT FK_5F8A7F732E39CD42 FOREIGN KEY (source_category_id) REFERENCES source_category (id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F732E39CD42');
    }

}
