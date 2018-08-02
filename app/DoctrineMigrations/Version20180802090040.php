<?php
declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20180802090040 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE opinion ADD published TINYINT(1) NOT NULL, ADD publishedAt DATETIME DEFAULT NULL, CHANGE updated_at updated_at DATETIME DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE source ADD published TINYINT(1) NOT NULL, ADD publishedAt DATETIME DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE argument ADD published TINYINT(1) NOT NULL, ADD publishedAt DATETIME DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE opinion_version ADD published TINYINT(1) NOT NULL, ADD publishedAt DATETIME DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE votes ADD published TINYINT(1) NOT NULL, ADD publishedAt DATETIME DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE proposal ADD published TINYINT(1) NOT NULL, ADD publishedAt DATETIME DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE comment ADD published TINYINT(1) NOT NULL, ADD publishedAt DATETIME DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE reply ADD published TINYINT(1) NOT NULL, ADD publishedAt DATETIME DEFAULT NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE argument DROP published, DROP publishedAt');
        $this->addSql('ALTER TABLE comment DROP published, DROP publishedAt');
        $this->addSql(
            'ALTER TABLE opinion DROP published, DROP publishedAt, CHANGE updated_at updated_at DATETIME NOT NULL'
        );
        $this->addSql('ALTER TABLE opinion_version DROP published, DROP publishedAt');
        $this->addSql('ALTER TABLE proposal DROP published, DROP publishedAt');
        $this->addSql('ALTER TABLE reply DROP published, DROP publishedAt');
        $this->addSql('ALTER TABLE source DROP published, DROP publishedAt');
        $this->addSql('ALTER TABLE votes DROP published, DROP publishedAt');
    }
}
