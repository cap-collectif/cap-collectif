<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220905103557 extends AbstractMigration implements ContainerAwareInterface
{

    private EntityManagerInterface $em;
    private UuidGenerator $generator;
    private TokenGeneratorInterface $tokenGenerator;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->tokenGenerator = $container->get('capco.fos_user.util.token_generator.default');
        $this->connection = $this->em->getConnection();
        $this->generator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'add proposal_analysis to comment table / migrate existing proposal_analysis comment to comment table';
    }

    public function postUp(Schema $schema): void
    {
        $rows = $this->connection->fetchAll("SELECT updated_by, comment from proposal_analysis WHERE comment IS NOT NULL");
        if (count($rows) > 0) {
            foreach ($rows as $row) {
                $uuid = $this->generator->generate($this->em, null);
                $token = $this->tokenGenerator->generateToken();
                $createdAt = $row['created_at'] ?? new \DateTime('now');

                $this->connection->insert('comment', [
                    'id' => $uuid,
                    'author_id' => $row['updated_by'],
                    'body' => $row['comment'],
                    'objectType' => 'analysis',
                    'updated_at' => $createdAt,
                    'created_at' => $createdAt,
                    'pinned' => '1',
                    'publishedAt' => $createdAt,
                    'published' => '1',
                    'moderation_token' => $token
                ]);
            }
        }
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'ALTER TABLE comment ADD proposal_analysis CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE comment ADD CONSTRAINT FK_9474526CE168FB18 FOREIGN KEY (proposal_analysis) REFERENCES proposal_analysis (id) ON DELETE CASCADE'
        );
        $this->addSql('CREATE INDEX IDX_9474526CE168FB18 ON comment (proposal_analysis)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526CE168FB18');
        $this->addSql('DROP INDEX IDX_9474526CE168FB18 ON comment');
        $this->addSql('ALTER TABLE comment DROP proposal_analysis');
    }
}
