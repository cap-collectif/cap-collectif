<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191002140242 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE category_image (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', image_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', updated_at DATETIME NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_2D0E4B163DA5256D (image_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE category_image ADD CONSTRAINT FK_2D0E4B163DA5256D FOREIGN KEY (image_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE proposal_category ADD category_media_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE proposal_category ADD CONSTRAINT FK_E71725E95DE5590E FOREIGN KEY (category_media_id) REFERENCES category_image (id) ON DELETE SET NULL'
        );
        $this->addSql('CREATE INDEX IDX_E71725E95DE5590E ON proposal_category (category_media_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE proposal_category DROP FOREIGN KEY FK_E71725E95DE5590E');
        $this->addSql('DROP TABLE category_image');
        $this->addSql('DROP INDEX IDX_E71725E95DE5590E ON proposal_category');
        $this->addSql('ALTER TABLE proposal_category DROP category_media_id');
    }
}
