<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150820111300 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE source ADD opinion_version_id INT DEFAULT NULL, CHANGE opinion_id opinion_id INT DEFAULT NULL'
        );
        $this->addSql(
            'ALTER TABLE source ADD CONSTRAINT FK_5F8A7F73D077154C FOREIGN KEY (opinion_version_id) REFERENCES opinion_version (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_5F8A7F73D077154C ON source (opinion_version_id)');
        $this->addSql('ALTER TABLE opinion_type ADD versionable TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE reporting ADD opinion_version_id INT DEFAULT NULL');
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9FD077154C FOREIGN KEY (opinion_version_id) REFERENCES opinion_version (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_BD7CFA9FD077154C ON reporting (opinion_version_id)');
        $this->addSql('ALTER TABLE synthesis_element ADD comment LONGTEXT DEFAULT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE opinion_type DROP versionable');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9FD077154C');
        $this->addSql('DROP INDEX IDX_BD7CFA9FD077154C ON reporting');
        $this->addSql('ALTER TABLE reporting DROP opinion_version_id');
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F73D077154C');
        $this->addSql('DROP INDEX IDX_5F8A7F73D077154C ON source');
        $this->addSql(
            'ALTER TABLE source DROP opinion_version_id, CHANGE opinion_id opinion_id INT NOT NULL'
        );
        $this->addSql('ALTER TABLE synthesis_element DROP comment');
    }
}
