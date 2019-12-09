<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150216170544 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE argument DROP FOREIGN KEY FK_D113B0A51885A6A');
        $this->addSql('ALTER TABLE argument DROP FOREIGN KEY FK_D113B0AF675F31B');
        $this->addSql(
            'ALTER TABLE argument ADD CONSTRAINT FK_D113B0A51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE argument ADD CONSTRAINT FK_D113B0AF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE argument_vote DROP FOREIGN KEY FK_C2E52574EBB4B8AD');
        $this->addSql(
            'ALTER TABLE argument_vote ADD CONSTRAINT FK_C2E52574EBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A6F675F31B');
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A6F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE SET NULL'
        );
        $this->addSql('ALTER TABLE idea DROP FOREIGN KEY FK_A8BCA45F675F31B');
        $this->addSql(
            'ALTER TABLE idea ADD CONSTRAINT FK_A8BCA45F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE idea_vote DROP FOREIGN KEY FK_995930CFEBB4B8AD');
        $this->addSql(
            'ALTER TABLE idea_vote ADD CONSTRAINT FK_995930CFEBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B027F675F31B');
        $this->addSql(
            'ALTER TABLE opinion ADD CONSTRAINT FK_AB02B027F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE opinion_vote DROP FOREIGN KEY FK_27D1F9BD51885A6A');
        $this->addSql('ALTER TABLE opinion_vote DROP FOREIGN KEY FK_27D1F9BDEBB4B8AD');
        $this->addSql(
            'ALTER TABLE opinion_vote ADD CONSTRAINT FK_27D1F9BD51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_vote ADD CONSTRAINT FK_27D1F9BDEBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE blog_post_authors DROP FOREIGN KEY FK_E93872E5A76ED395');
        $this->addSql(
            'ALTER TABLE blog_post_authors ADD CONSTRAINT FK_E93872E5A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9FE1CFE6F5');
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9FE1CFE6F5 FOREIGN KEY (reporter_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F7351885A6A');
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F73F675F31B');
        $this->addSql(
            'ALTER TABLE source ADD CONSTRAINT FK_5F8A7F7351885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE source ADD CONSTRAINT FK_5F8A7F73F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE source_vote DROP FOREIGN KEY FK_5B9A0067EBB4B8AD');
        $this->addSql(
            'ALTER TABLE source_vote ADD CONSTRAINT FK_5B9A0067EBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE theme DROP FOREIGN KEY FK_9775E708F675F31B');
        $this->addSql(
            'ALTER TABLE theme ADD CONSTRAINT FK_9775E708F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id) ON DELETE SET NULL'
        );
    }

    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE argument DROP FOREIGN KEY FK_D113B0AF675F31B');
        $this->addSql('ALTER TABLE argument DROP FOREIGN KEY FK_D113B0A51885A6A');
        $this->addSql(
            'ALTER TABLE argument ADD CONSTRAINT FK_D113B0AF675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE argument ADD CONSTRAINT FK_D113B0A51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id)'
        );
        $this->addSql('ALTER TABLE argument_vote DROP FOREIGN KEY FK_C2E52574EBB4B8AD');
        $this->addSql(
            'ALTER TABLE argument_vote ADD CONSTRAINT FK_C2E52574EBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id)'
        );
        $this->addSql('ALTER TABLE blog_post_authors DROP FOREIGN KEY FK_E93872E5A76ED395');
        $this->addSql(
            'ALTER TABLE blog_post_authors ADD CONSTRAINT FK_E93872E5A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id)'
        );
        $this->addSql('ALTER TABLE consultation DROP FOREIGN KEY FK_964685A6F675F31B');
        $this->addSql(
            'ALTER TABLE consultation ADD CONSTRAINT FK_964685A6F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
        $this->addSql('ALTER TABLE idea DROP FOREIGN KEY FK_A8BCA45F675F31B');
        $this->addSql(
            'ALTER TABLE idea ADD CONSTRAINT FK_A8BCA45F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
        $this->addSql('ALTER TABLE idea_vote DROP FOREIGN KEY FK_995930CFEBB4B8AD');
        $this->addSql(
            'ALTER TABLE idea_vote ADD CONSTRAINT FK_995930CFEBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id)'
        );
        $this->addSql('ALTER TABLE opinion DROP FOREIGN KEY FK_AB02B027F675F31B');
        $this->addSql(
            'ALTER TABLE opinion ADD CONSTRAINT FK_AB02B027F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
        $this->addSql('ALTER TABLE opinion_vote DROP FOREIGN KEY FK_27D1F9BD51885A6A');
        $this->addSql('ALTER TABLE opinion_vote DROP FOREIGN KEY FK_27D1F9BDEBB4B8AD');
        $this->addSql(
            'ALTER TABLE opinion_vote ADD CONSTRAINT FK_27D1F9BD51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id)'
        );
        $this->addSql(
            'ALTER TABLE opinion_vote ADD CONSTRAINT FK_27D1F9BDEBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id)'
        );
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9FE1CFE6F5');
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9FE1CFE6F5 FOREIGN KEY (reporter_id) REFERENCES fos_user (id)'
        );
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F73F675F31B');
        $this->addSql('ALTER TABLE source DROP FOREIGN KEY FK_5F8A7F7351885A6A');
        $this->addSql(
            'ALTER TABLE source ADD CONSTRAINT FK_5F8A7F73F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
        $this->addSql(
            'ALTER TABLE source ADD CONSTRAINT FK_5F8A7F7351885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id)'
        );
        $this->addSql('ALTER TABLE source_vote DROP FOREIGN KEY FK_5B9A0067EBB4B8AD');
        $this->addSql(
            'ALTER TABLE source_vote ADD CONSTRAINT FK_5B9A0067EBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id)'
        );
        $this->addSql('ALTER TABLE theme DROP FOREIGN KEY FK_9775E708F675F31B');
        $this->addSql(
            'ALTER TABLE theme ADD CONSTRAINT FK_9775E708F675F31B FOREIGN KEY (author_id) REFERENCES fos_user (id)'
        );
    }
}
