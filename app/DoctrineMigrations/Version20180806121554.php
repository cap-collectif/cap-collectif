<?php declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20180806121554 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE user_following_proposal RENAME TO user_following');
        $this->addSql(
            'ALTER TABLE user_following ADD opinion_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE user_following CHANGE proposal_id proposal_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE user_following ADD CONSTRAINT FK_715F000751885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE project ADD opinion_can_be_followed TINYINT(1) DEFAULT \'0\' NOT NULL'
        );
        $this->addSql('ALTER TABLE user_following DROP FOREIGN KEY FK_715F000751885A6A');
        $this->addSql('ALTER TABLE user_following DROP FOREIGN KEY FK_E0A7FBE1A76ED395');
        $this->addSql('ALTER TABLE user_following DROP FOREIGN KEY FK_E0A7FBE1F4792058');
        $this->addSql(
            'CREATE UNIQUE INDEX follower_unique_opinion ON user_following (user_id, opinion_id)'
        );
        $this->addSql('DROP INDEX idx_e0a7fbe1a76ed395 ON user_following');
        $this->addSql('CREATE INDEX IDX_715F0007A76ED395 ON user_following (user_id)');
        $this->addSql('DROP INDEX idx_e0a7fbe1f4792058 ON user_following');
        $this->addSql('CREATE INDEX IDX_715F0007F4792058 ON user_following (proposal_id)');
        $this->addSql('DROP INDEX fk_715f000751885a6a ON user_following');
        $this->addSql('CREATE INDEX IDX_715F000751885A6A ON user_following (opinion_id)');
        $this->addSql('DROP INDEX follower_unique ON user_following');
        $this->addSql(
            'CREATE UNIQUE INDEX follower_unique_proposal ON user_following (user_id, proposal_id)'
        );
        $this->addSql(
            'ALTER TABLE user_following ADD CONSTRAINT FK_715F000751885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE user_following ADD CONSTRAINT FK_E0A7FBE1A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE user_following ADD CONSTRAINT FK_E0A7FBE1F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() !== 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP INDEX follower_unique_opinion ON user_following');
        $this->addSql('ALTER TABLE user_following DROP FOREIGN KEY FK_715F0007A76ED395');
        $this->addSql('ALTER TABLE user_following DROP FOREIGN KEY FK_715F0007F4792058');
        $this->addSql('ALTER TABLE user_following DROP FOREIGN KEY FK_715F000751885A6A');
        $this->addSql(
            'ALTER TABLE user_following CHANGE notified_of notified_of VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci'
        );
        $this->addSql('DROP INDEX follower_unique_proposal ON user_following');
        $this->addSql(
            'CREATE UNIQUE INDEX follower_unique ON user_following (user_id, proposal_id)'
        );
        $this->addSql('DROP INDEX idx_715f0007a76ed395 ON user_following');
        $this->addSql('CREATE INDEX IDX_E0A7FBE1A76ED395 ON user_following (user_id)');
        $this->addSql('DROP INDEX idx_715f0007f4792058 ON user_following');
        $this->addSql('CREATE INDEX IDX_E0A7FBE1F4792058 ON user_following (proposal_id)');
        $this->addSql('DROP INDEX idx_715f000751885a6a ON user_following');
        $this->addSql('CREATE INDEX FK_715F000751885A6A ON user_following (opinion_id)');
        $this->addSql(
            'ALTER TABLE user_following ADD CONSTRAINT FK_715F0007A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE user_following ADD CONSTRAINT FK_715F0007F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE user_following ADD CONSTRAINT FK_715F000751885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE user_following RENAME TO user_following_proposal');
        $this->addSql('ALTER TABLE user_following_proposal DROP opinion_id');
        $this->addSql('ALTER TABLE project DROP opinion_can_be_followed');
    }

    public function postUp(Schema $schema)
    {
        $this->write('--> Migrating subscription type 1 to MINIMAL');
        $followers = $this->connection->fetchAll(
            'SELECT id from user_following WHERE notified_of = 1'
        );
        foreach ($followers as $follower) {
            $this->connection->update(
                'user_following',
                ['notified_of' => FollowerNotifiedOfInterface::MINIMAL],
                ['id' => $follower['id']]
            );
        }
        $this->write('--> Migrated successfully subscription type 1 to MINIMAL!');

        $this->write('--> Migrating subscription type 2 to ESSENTIAL');
        $followers = $this->connection->fetchAll(
            'SELECT id from user_following WHERE notified_of = 2'
        );
        foreach ($followers as $follower) {
            $this->connection->update(
                'user_following',
                ['notified_of' => FollowerNotifiedOfInterface::ESSENTIAL],
                ['id' => $follower['id']]
            );
        }
        $this->write('--> Migrated successfully subscription type 2 to ESSENTIAL!');

        $this->write('--> Migrating subscription type 3 to ALL');
        $followers = $this->connection->fetchAll(
            'SELECT id from user_following WHERE notified_of = 3'
        );
        foreach ($followers as $follower) {
            $this->connection->update(
                'user_following',
                ['notified_of' => FollowerNotifiedOfInterface::ALL],
                ['id' => $follower['id']]
            );
        }
        $this->write('--> Migrated successfully subscription type 3 to ALL!');
    }
}
