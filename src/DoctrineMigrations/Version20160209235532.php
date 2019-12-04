<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160209235532 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void{
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE user_favorite_proposal (proposal_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_EDAD37A8F4792058 (proposal_id), INDEX IDX_EDAD37A8A76ED395 (user_id), PRIMARY KEY(proposal_id, user_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE user_favorite_proposal ADD CONSTRAINT FK_EDAD37A8F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE user_favorite_proposal ADD CONSTRAINT FK_EDAD37A8A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void{
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE user_favorite_proposal');
    }
}
