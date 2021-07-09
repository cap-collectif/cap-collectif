<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210628104349 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add owner_id in blog_post';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE blog_post ADD owner_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE blog_post ADD CONSTRAINT FK_BA5AE01D7E3C61F9 FOREIGN KEY (owner_id) REFERENCES fos_user (id)'
        );
        $this->addSql('CREATE INDEX IDX_BA5AE01D7E3C61F9 ON blog_post (owner_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blog_post DROP FOREIGN KEY FK_BA5AE01D7E3C61F9');
        $this->addSql('DROP INDEX IDX_BA5AE01D7E3C61F9 ON blog_post');
        $this->addSql('ALTER TABLE blog_post DROP owner_id');
    }
}
