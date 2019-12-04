<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150330130028 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;

    /**
     * Sets the Container.
     *
     * @param ContainerInterface|null $container A ContainerInterface instance or null
     *
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE votes (id INT AUTO_INCREMENT NOT NULL, voter_id INT DEFAULT NULL, idea_id INT DEFAULT NULL, comment_id INT DEFAULT NULL, opinion_id INT DEFAULT NULL, argument_id INT DEFAULT NULL, source_id INT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, confirmed TINYINT(1) NOT NULL, voteType VARCHAR(255) NOT NULL, username VARCHAR(255) DEFAULT NULL, email VARCHAR(255) DEFAULT NULL, ip_address VARCHAR(255) DEFAULT NULL, private TINYINT(1) DEFAULT NULL, value INT DEFAULT NULL, INDEX IDX_518B7ACFEBB4B8AD (voter_id), INDEX IDX_518B7ACF5B6FEF7D (idea_id), INDEX IDX_518B7ACFF8697D13 (comment_id), INDEX IDX_518B7ACF51885A6A (opinion_id), INDEX IDX_518B7ACF3DD48F21 (argument_id), INDEX IDX_518B7ACF953C1C61 (source_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFEBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF5B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id)'
        );
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACFF8697D13 FOREIGN KEY (comment_id) REFERENCES comment (id)'
        );
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF3DD48F21 FOREIGN KEY (argument_id) REFERENCES argument (id)'
        );
        $this->addSql(
            'ALTER TABLE votes ADD CONSTRAINT FK_518B7ACF953C1C61 FOREIGN KEY (source_id) REFERENCES source (id)'
        );
        $this->addSql(
            'ALTER TABLE fos_user ADD comments_count INT NOT NULL, ADD votes_count INT NOT NULL, ADD ideas_count INT NOT NULL, ADD arguments_count INT NOT NULL, ADD sources_count INT NOT NULL, ADD opinions_count INT NOT NULL'
        );
    }

    public function postUp(Schema $schmea): void
    {
        $arguments_vote = $this->connection->fetchAll('SELECT * FROM argument_vote');
        $comments_vote = $this->connection->fetchAll('SELECT * FROM comment_vote');
        $ideas_vote = $this->connection->fetchAll('SELECT * FROM idea_vote');
        $opinions_vote = $this->connection->fetchAll('SELECT * FROM opinion_vote');
        $sources_vote = $this->connection->fetchAll('SELECT * FROM source_vote');

        foreach ($arguments_vote as $vote) {
            $this->connection->insert('votes', [
                'voter_id' => $vote['voter_id'],
                'argument_id' => $vote['argument_id'],
                'created_at' => $vote['created_at'],
                'updated_at' => $vote['updated_at'],
                'confirmed' => 1,
                'voteType' => 'argument',
            ]);
        }

        foreach ($comments_vote as $vote) {
            $this->connection->insert('votes', [
                'voter_id' => $vote['voter_id'],
                'comment_id' => $vote['comment_id'],
                'created_at' => $vote['created_at'],
                'updated_at' => $vote['updated_at'],
                'confirmed' => 1,
                'voteType' => 'comment',
            ]);
        }

        foreach ($ideas_vote as $vote) {
            $this->connection->insert('votes', [
                'voter_id' => $vote['voter_id'],
                'idea_id' => $vote['Idea_id'],
                'created_at' => $vote['created_at'],
                'updated_at' => $vote['created_at'],
                'confirmed' => $vote['confirmed'],
                'username' => $vote['username'],
                'email' => $vote['email'],
                'ip_address' => $vote['ip_address'],
                'private' => $vote['private'],
                'voteType' => 'idea',
            ]);
        }

        foreach ($opinions_vote as $vote) {
            $this->connection->insert('votes', [
                'voter_id' => $vote['voter_id'],
                'opinion_id' => $vote['opinion_id'],
                'created_at' => $vote['created_at'],
                'updated_at' => $vote['updated_at'],
                'confirmed' => 1,
                'value' => $vote['value'],
                'voteType' => 'opinion',
            ]);
        }

        foreach ($sources_vote as $vote) {
            $this->connection->insert('votes', [
                'voter_id' => $vote['voter_id'],
                'source_id' => $vote['source_id'],
                'created_at' => $vote['created_at'],
                'updated_at' => $vote['created_at'],
                'confirmed' => 1,
                'voteType' => 'source',
            ]);
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE argument_vote ADD CONSTRAINT FK_C2E525743DD48F21 FOREIGN KEY (argument_id) REFERENCES argument (id)'
        );
        $this->addSql(
            'ALTER TABLE argument_vote ADD CONSTRAINT FK_C2E52574EBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE comment_vote ADD CONSTRAINT FK_7C262788EBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE comment_vote ADD CONSTRAINT FK_7C262788F8697D13 FOREIGN KEY (comment_id) REFERENCES comment (id)'
        );
        $this->addSql(
            'ALTER TABLE idea_vote ADD CONSTRAINT FK_995930CF5B6FEF7D FOREIGN KEY (idea_id) REFERENCES idea (id)'
        );
        $this->addSql(
            'ALTER TABLE idea_vote ADD CONSTRAINT FK_995930CFEBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_vote ADD CONSTRAINT FK_27D1F9BD51885A6A FOREIGN KEY (opinion_id) REFERENCES opinion (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE opinion_vote ADD CONSTRAINT FK_27D1F9BDEBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE source_vote ADD CONSTRAINT FK_5B9A0067953C1C61 FOREIGN KEY (source_id) REFERENCES source (id)'
        );
        $this->addSql(
            'ALTER TABLE source_vote ADD CONSTRAINT FK_5B9A0067EBB4B8AD FOREIGN KEY (voter_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql('DROP TABLE votes');
        $this->addSql(
            'ALTER TABLE fos_user DROP comments_count, DROP votes_count, DROP ideas_count, DROP arguments_count, DROP sources_count, DROP opinions_count'
        );
    }
}
