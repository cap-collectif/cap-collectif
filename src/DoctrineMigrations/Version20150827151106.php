<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150827151106 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE opinion_appendices DROP FOREIGN KEY FK_CE7C748A8DAE1A1E');
        $this->addSql('DROP TABLE opinion_appendices');
        $this->addSql('DROP TABLE opinion_type_appendices_type');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE opinion_appendices (id INT AUTO_INCREMENT NOT NULL, opinion_id INT DEFAULT NULL, opinion_type_part_id INT DEFAULT NULL, body LONGTEXT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_CE7C748A8DAE1A1E (opinion_type_part_id), INDEX IDX_CE7C748A51885A6A (opinion_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE opinion_type_appendices_type (id INT AUTO_INCREMENT NOT NULL, opinion_type_id INT NOT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, position INT NOT NULL, INDEX IDX_A4C8254928FD468D (opinion_type_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE opinion_appendices ADD CONSTRAINT FK_CE7C748A51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_appendices ADD CONSTRAINT FK_CE7C748A8DAE1A1E FOREIGN KEY (opinion_type_part_id) REFERENCES opinion_type_appendices_type (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_type_appendices_type ADD CONSTRAINT FK_A4C8254928FD468D FOREIGN KEY (opinion_type_id) REFERENCES opinion_type (id) ON DELETE CASCADE'
        );
    }
}
