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
class Version20171122175657 extends AbstractMigration implements ContainerAwareInterface
{
    private $em;
    private $generator;
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->container = $container;
        $this->generator = new UuidGenerator();
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE user_notifications_configuration (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', unsubscribe_token VARCHAR(255) NOT NULL, on_proposal_comment_mail TINYINT(1) DEFAULT \'1\' NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE fos_user ADD notifications_configuration_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\''
        );
        $this->addSql(
            'ALTER TABLE fos_user ADD CONSTRAINT FK_957A6479580B13B7 FOREIGN KEY (notifications_configuration_id) REFERENCES user_notifications_configuration (id)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX UNIQ_957A6479580B13B7 ON fos_user (notifications_configuration_id)'
        );
        $this->addSql(
            'CREATE UNIQUE INDEX UNIQ_AAEA4B03E0674361 ON user_notifications_configuration (unsubscribe_token)'
        );
    }

    public function postUp(Schema $schema)
    {
        echo '-> Adding user notifications for existing users...' . PHP_EOL;
        $users = $this->connection->fetchAll(
            'SELECT id, notifications_configuration_id from fos_user'
        );
        foreach ($users as $user) {
            if (!$user['notifications_configuration_id']) {
                $uuid = $this->generator->generate($this->em, null);
                $this->connection->insert('user_notifications_configuration', [
                    'id' => $uuid,
                    'on_proposal_comment_mail' => 1,
                    'unsubscribe_token' =>
                        $this->container->get('fos_user.util.token_generator')->generateToken(),
                ]);
                $this->connection->update(
                    'fos_user',
                    ['notifications_configuration_id' => $uuid],
                    ['id' => $user['id']]
                );
            }
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        $this->addSql('ALTER TABLE fos_user DROP FOREIGN KEY FK_957A6479580B13B7');
        $this->addSql('DROP TABLE user_notifications_configuration');
        $this->addSql('DROP INDEX UNIQ_AAEA4B03E0674361 ON user_notifications_configuration');
        $this->addSql('DROP INDEX UNIQ_957A6479580B13B7 ON fos_user');
        $this->addSql('ALTER TABLE fos_user DROP notifications_configuration_id');
    }
}
