<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180226163217 extends AbstractMigration implements ContainerAwareInterface
{
    private $generator;
    private $em;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE user_following_proposal (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', followed_at DATETIME NOT NULL, INDEX IDX_E0A7FBE1A76ED395 (user_id), INDEX IDX_E0A7FBE1F4792058 (proposal_id), UNIQUE INDEX follower_unique (user_id, proposal_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE user_following_proposal ADD CONSTRAINT FK_E0A7FBE1A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE user_following_proposal ADD CONSTRAINT FK_E0A7FBE1F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id) ON DELETE CASCADE'
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE user_following_proposal');
    }

    public function postUp(Schema $schema): void
    {
        $proposals = $this->connection->fetchAll('SELECT id, created_at, author_id from proposal');
        foreach ($proposals as $proposal) {
            $uuid = $this->generator->generate($this->em, null);
            $this->connection->insert('user_following_proposal', [
                'id' => $uuid,
                'user_id' => $proposal['author_id'],
                'proposal_id' => $proposal['id'],
                'followed_at' => $proposal['created_at']
            ]);
        }
    }
}
