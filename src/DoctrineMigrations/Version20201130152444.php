<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Entity\Locale;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20201130152444 extends AbstractMigration implements ContainerAwareInterface
{
    private ?ContainerInterface $container;
    private EntityManagerInterface $em;
    private UuidGenerator $generator;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
        $this->em = $this->container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'official response';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        //create tables
        $this->addSql(
            'CREATE TABLE official_response (
                id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\',
                proposal_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\',
                is_published TINYINT(1) NOT NULL,
                published_at DATETIME DEFAULT NULL,
                updated_at DATETIME NOT NULL,
                body LONGTEXT DEFAULT NULL,
                created_at DATETIME NOT NULL,
                UNIQUE INDEX UNIQ_FEE68747F4792058 (proposal_id),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'CREATE TABLE official_response_author (
                official_response_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\',
                user_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\',
                INDEX IDX_7A803372E3F174A (official_response_id),
                INDEX IDX_7A80337A76ED395 (user_id),
                PRIMARY KEY(official_response_id, user_id)
            ) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE official_response ADD CONSTRAINT FK_FEE68747F4792058 FOREIGN KEY (proposal_id) REFERENCES proposal (id)'
        );
        $this->addSql(
            'ALTER TABLE official_response_author ADD CONSTRAINT FK_7A803372E3F174A FOREIGN KEY (official_response_id) REFERENCES official_response (id) ON DELETE CASCADE'
        );
        $this->addSql(
            'ALTER TABLE official_response_author ADD CONSTRAINT FK_7A80337A76ED395 FOREIGN KEY (user_id) REFERENCES fos_user (id) ON DELETE CASCADE'
        );

        //add official response in proposal_decision (constraints are added in the postup).
        $this->addSql(
            'ALTER TABLE proposal_decision ADD official_response_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            '#ALTER TABLE proposal_decision ADD CONSTRAINT FK_65F782602E3F174A FOREIGN KEY (official_response_id) REFERENCES official_response (id)'
        );
        $this->addSql(
            '#CREATE UNIQUE INDEX UNIQ_65F782602E3F174A ON proposal_decision (official_response_id)'
        );

        //proposaldecision.post is removed in Version20201203122444 postup.
        $this->addSql('#ALTER TABLE proposal_decision DROP FOREIGN KEY FK_65F782604B89032C');
        $this->addSql('#DROP INDEX UNIQ_65F782604B89032C ON proposal_decision');
        $this->addSql('#ALTER TABLE proposal_decision DROP post_id');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE official_response_author DROP FOREIGN KEY FK_7A803372E3F174A');
        $this->addSql('ALTER TABLE proposal_decision DROP FOREIGN KEY FK_65F782602E3F174A');
        $this->addSql('#DROP TABLE official_response');
        $this->addSql('#DROP TABLE official_response_author');
        $this->addSql('DROP INDEX UNIQ_65F782602E3F174A ON proposal_decision');
        $this->addSql(
            '#ALTER TABLE proposal_decision CHANGE official_response_id post_id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            '#ALTER TABLE proposal_decision ADD CONSTRAINT FK_65F782604B89032C FOREIGN KEY (post_id) REFERENCES blog_post (id)'
        );
        $this->addSql('#CREATE UNIQUE INDEX UNIQ_65F782604B89032C ON proposal_decision (post_id)');
    }
}
