<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150407145146 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE user_type (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql('ALTER TABLE fos_user ADD user_type_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE fos_user ADD CONSTRAINT FK_957A64799D419299 FOREIGN KEY (user_type_id) REFERENCES user_type (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_957A64799D419299 ON fos_user (user_type_id)');
    }

    public function postUp(Schema $schema): void
    {
        $date = (new \DateTime())->format('Y-m-d H:i:s');
        $types = [
            'Citoyen',
            'Organisation à but lucratif',
            'Organisation à but non lucratif',
            'Institution'
        ];
        $date = (new \DateTime())->format('Y-m-d H:i:s');
        foreach ($types as $type) {
            $this->connection->insert('user_type', [
                'name' => $type,
                'created_at' => $date,
                'updated_at' => $date
            ]);
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE fos_user DROP FOREIGN KEY FK_957A64799D419299');
        $this->addSql('DROP INDEX IDX_957A64799D419299 ON fos_user');
        $this->addSql('ALTER TABLE fos_user DROP user_type_id');
        $this->addSql('DROP TABLE user_type');
    }
}
