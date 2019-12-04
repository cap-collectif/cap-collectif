<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160823154042 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE proposal_post (post_id INT NOT NULL, proposal_id INT NOT NULL, INDEX IDX_7AEB79F64B89032C (post_id), INDEX IDX_7AEB79F6F4792058 (proposal_id), PRIMARY KEY(post_id, proposal_id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE proposal_post ADD CONSTRAINT FK_7AEB79F64B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE proposal_post ADD CONSTRAINT FK_7AEB79F6F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE blog_post ADD dislayed_on_blog TINYINT(1)');
        $this->addSql('UPDATE blog_post SET dislayed_on_blog = 1');
        $this->addSql(
            'ALTER TABLE blog_post CHANGE dislayed_on_blog dislayed_on_blog TINYINT(1) NOT NULL'
        );
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE proposal_post');
        $this->addSql('ALTER TABLE blog_post DROP dislayed_on_blog');
    }
}
