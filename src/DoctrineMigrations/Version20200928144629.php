<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20200928144629 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'new entity MailingList';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE mailing_list (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', project_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', name VARCHAR(255) NOT NULL, is_deletable TINYINT(1) DEFAULT \'1\' NOT NULL, INDEX IDX_15C473AF166D1F9C (project_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE mailing_list_user (mailinglist_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', INDEX IDX_FA5879EF1573C2D3 (mailinglist_id), INDEX IDX_FA5879EFA76ED395 (user_id), PRIMARY KEY(mailinglist_id, user_id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE mailing_list ADD CONSTRAINT FK_15C473AF166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)'
        );
        $this->addSql(
            'ALTER TABLE mailing_list_user ADD CONSTRAINT FK_FA5879EF1573C2D3 FOREIGN KEY (mailinglist_id) REFERENCES mailing_list (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE mailing_list_user ADD CONSTRAINT FK_FA5879EFA76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE mailing_list_user DROP FOREIGN KEY FK_FA5879EF1573C2D3');
        $this->addSql('DROP TABLE mailing_list');
        $this->addSql('DROP TABLE mailing_list_user');
    }
}
