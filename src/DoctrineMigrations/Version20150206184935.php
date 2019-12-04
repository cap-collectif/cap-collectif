<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150206184935 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE fos_user DROP FOREIGN KEY FK_957A6479EA9FDD75');
        $this->addSql(
            'ALTER TABLE fos_user ADD CONSTRAINT FK_957A6479EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A63DA5256D');
        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A6922726E9');
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A63DA5256D FOREIGN KEY (image_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A6922726E9 FOREIGN KEY (cover_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE idea DROP FOREIGN KEY FK_A8BCA45EA9FDD75');
        $this->addSql(
            'ALTER TABLE idea ADD CONSTRAINT FK_A8BCA45EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE page DROP FOREIGN KEY FK_140AB620EA9FDD75');
        $this->addSql(
            'ALTER TABLE page ADD CONSTRAINT FK_140AB620EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE blog_post DROP FOREIGN KEY FK_BA5AE01DEA9FDD75');
        $this->addSql(
            'ALTER TABLE blog_post ADD CONSTRAINT FK_BA5AE01DEA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE site_image DROP FOREIGN KEY FK_167D45A13E9BF23');
        $this->addSql(
            'ALTER TABLE site_image ADD CONSTRAINT FK_167D45A13E9BF23 FOREIGN KEY (Media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE social_network DROP FOREIGN KEY FK_EFFF5221EA9FDD75');
        $this->addSql(
            'ALTER TABLE social_network ADD CONSTRAINT FK_EFFF5221EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE theme DROP FOREIGN KEY FK_9775E708EA9FDD75');
        $this->addSql(
            'ALTER TABLE theme ADD CONSTRAINT FK_9775E708EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id) ON DELETE SET NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE blog_post DROP FOREIGN KEY FK_BA5AE01DEA9FDD75');
        $this->addSql(
            'ALTER TABLE blog_post ADD CONSTRAINT FK_BA5AE01DEA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A6922726E9');
        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A63DA5256D');
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A6922726E9 FOREIGN KEY (cover_id) REFERENCES media__media (id)'
        );
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A63DA5256D FOREIGN KEY (image_id) REFERENCES media__media (id)'
        );
        $this->addSql('ALTER TABLE fos_user DROP FOREIGN KEY FK_957A6479EA9FDD75');
        $this->addSql(
            'ALTER TABLE fos_user ADD CONSTRAINT FK_957A6479EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql('ALTER TABLE idea DROP FOREIGN KEY FK_A8BCA45EA9FDD75');
        $this->addSql(
            'ALTER TABLE idea ADD CONSTRAINT FK_A8BCA45EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql('ALTER TABLE page DROP FOREIGN KEY FK_140AB620EA9FDD75');
        $this->addSql(
            'ALTER TABLE page ADD CONSTRAINT FK_140AB620EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql('ALTER TABLE site_image DROP FOREIGN KEY FK_167D45A13E9BF23');
        $this->addSql(
            'ALTER TABLE site_image ADD CONSTRAINT FK_167D45A13E9BF23 FOREIGN KEY (Media_id) REFERENCES media__media (id)'
        );
        $this->addSql('ALTER TABLE social_network DROP FOREIGN KEY FK_EFFF5221EA9FDD75');
        $this->addSql(
            'ALTER TABLE social_network ADD CONSTRAINT FK_EFFF5221EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
        $this->addSql('ALTER TABLE theme DROP FOREIGN KEY FK_9775E708EA9FDD75');
        $this->addSql(
            'ALTER TABLE theme ADD CONSTRAINT FK_9775E708EA9FDD75 FOREIGN KEY (media_id) REFERENCES media__media (id)'
        );
    }
}
