<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220315113015 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'add sms_credit, sms_order and sms_remaining_credit_email_alert table';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE sms_credit (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', sms_order_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', amount INT NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_999F06EEB694C39 (sms_order_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE sms_order (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', amount INT NOT NULL, is_processed TINYINT(1) DEFAULT \'0\' NOT NULL, created_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE sms_remaining_credit_email_alert (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', sms_credit_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', status VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_A9BD8EFAB967E94E (sms_credit_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE sms_credit ADD CONSTRAINT FK_999F06EEB694C39 FOREIGN KEY (sms_order_id) REFERENCES sms_order (id)');
        $this->addSql('ALTER TABLE sms_remaining_credit_email_alert ADD CONSTRAINT FK_A9BD8EFAB967E94E FOREIGN KEY (sms_credit_id) REFERENCES sms_credit (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE sms_remaining_credit_email_alert DROP FOREIGN KEY FK_A9BD8EFAB967E94E');
        $this->addSql('ALTER TABLE sms_credit DROP FOREIGN KEY FK_999F06EEB694C39');
        $this->addSql('DROP TABLE sms_credit');
        $this->addSql('DROP TABLE sms_order');
        $this->addSql('DROP TABLE sms_remaining_credit_email_alert');
    }
}
