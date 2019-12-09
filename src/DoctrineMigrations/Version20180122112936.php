<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180122112936 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        if ($this->sm->tablesExist(['fos_user_user_group', 'fos_user_group'])) {
            $this->addSql('ALTER TABLE fos_user_user_group DROP FOREIGN KEY FK_B3C77447FE54D947');
            $this->addSql('DROP TABLE fos_user_group');
            $this->addSql('DROP TABLE fos_user_user_group');
        }
        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E83473B21E9C');
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E83473B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE SET NULL'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        if (!$this->sm->tablesExist(['fos_user_user_group', 'fos_user_group'])) {
            $this->addSql(
                'CREATE TABLE fos_user_group (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci, roles LONGTEXT NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:array)\', UNIQUE INDEX UNIQ_583D1F3E5E237E06 (name), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
            );
            $this->addSql(
                'CREATE TABLE fos_user_user_group (user_id CHAR(36) NOT NULL COLLATE utf8_unicode_ci COMMENT \'(DC2Type:guid)\', group_id INT NOT NULL, INDEX IDX_B3C77447FE54D947 (group_id), INDEX IDX_B3C77447A76ED395 (user_id), PRIMARY KEY(user_id, group_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
            );
            $this->addSql(
                'ALTER TABLE fos_user_user_group ADD CONSTRAINT FK_B3C77447A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE'
            );
            $this->addSql(
                'ALTER TABLE fos_user_user_group ADD CONSTRAINT FK_B3C77447FE54D947 FOREIGN KEY (group_id) REFERENCES fos_user_group (id) ON DELETE CASCADE'
            );
        }

        $this->addSql('ALTER TABLE proposal_form DROP FOREIGN KEY FK_72E9E83473B21E9C');
        $this->addSql(
            'ALTER TABLE proposal_form ADD CONSTRAINT FK_72E9E83473B21E9C FOREIGN KEY (step_id) REFERENCES step (id) ON DELETE CASCADE'
        );
    }
}
