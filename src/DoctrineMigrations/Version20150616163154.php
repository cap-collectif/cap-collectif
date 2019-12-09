<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150616163154 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACF3DD48F21');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACF5B6FEF7D');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACF953C1C61');
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF3DD48F21 FOREIGN KEY (argument_id) REFERENCES argument (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF5B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF953C1C61 FOREIGN KEY (source_id) REFERENCES source (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD284B89032C');
        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD2859027487');
        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD285B6FEF7D');
        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD2862FF6CDF');
        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD2871F7E88B');
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD284B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD2859027487 FOREIGN KEY (theme_id) REFERENCES theme (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD285B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD2862FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD2871F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F3DD48F21');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F51885A6A');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F5B6FEF7D');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F953C1C61');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9FF8697D13');
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F3DD48F21 FOREIGN KEY (argument_id) REFERENCES argument (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F5B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F953C1C61 FOREIGN KEY (source_id) REFERENCES source (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9FF8697D13 FOREIGN KEY (comment_id) REFERENCES comment (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD284B89032C');
        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD2859027487');
        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD2862FF6CDF');
        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD285B6FEF7D');
        $this->addSql('ALTER TABLE highlighted_content DROP FOREIGN KEY FK_5143CD2871F7E88B');
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD284B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id)'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD2859027487 FOREIGN KEY (theme_id) REFERENCES theme (id)'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD2862FF6CDF FOREIGN KEY (consultation_id) REFERENCES consultation (id)'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD285B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id)'
        );
        $this->addSql(
            'ALTER TABLE highlighted_content ADD CONSTRAINT FK_5143CD2871F7E88B FOREIGN KEY (event_id) REFERENCES event (id)'
        );
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F51885A6A');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F953C1C61');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F3DD48F21');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9F5B6FEF7D');
        $this->addSql('ALTER TABLE reporting DROP FOREIGN KEY FK_BD7CFA9FF8697D13');
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id)'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F953C1C61 FOREIGN KEY (source_id) REFERENCES source (id)'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F3DD48F21 FOREIGN KEY (argument_id) REFERENCES argument (id)'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9F5B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id)'
        );
        $this->addSql(
            'ALTER TABLE reporting ADD CONSTRAINT FK_BD7CFA9FF8697D13 FOREIGN KEY (comment_id) REFERENCES comment (id)'
        );
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACF5B6FEF7D');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACF3DD48F21');
        $this->addSql('ALTER TABLE votes DROP FOREIGN KEY FK_518B7ACF953C1C61');
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF5B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id)'
        );
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF3DD48F21 FOREIGN KEY (argument_id) REFERENCES argument (id)'
        );
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF953C1C61 FOREIGN KEY (source_id) REFERENCES source (id)'
        );
    }
}
