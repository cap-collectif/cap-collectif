<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Helper\EnvHelper;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190520093622 extends AbstractMigration implements ContainerAwareInterface
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
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE sso_configuration (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', name VARCHAR(255) NOT NULL, enabled TINYINT(1) NOT NULL, ssoType VARCHAR(255) NOT NULL, client_id VARCHAR(255) DEFAULT NULL, secret VARCHAR(255) DEFAULT NULL, authorization_url LONGTEXT DEFAULT NULL, access_token_url LONGTEXT DEFAULT NULL, user_info_url LONGTEXT DEFAULT NULL, logout_url LONGTEXT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB'
        );
    }

    public function postUp(Schema $schema): void
    {
        $instanceName = EnvHelper::get('SYMFONY_INSTANCE_NAME');

        switch ($instanceName) {
            case 'occitanie':
                $this->connection->insert('sso_configuration', [
                    'id' => $this->generator->generate($this->em, null),
                    'name' => 'occitanie-openid',
                    'enabled' => 1,
                    'ssoType' => 'oauth2',
                    'client_id' => 'capcollectif',
                    'secret' => '***REMOVED***',
                    'authorization_url' =>
                        'https://www.laregioncitoyenne.fr/auth/realms/laregioncitoyenne/protocol/openid-connect/auth',
                    'access_token_url' =>
                        'https://www.laregioncitoyenne.fr/auth/realms/laregioncitoyenne/protocol/openid-connect/token',
                    'user_info_url' =>
                        'https://www.laregioncitoyenne.fr/auth/realms/laregioncitoyenne/protocol/openid-connect/userinfo',
                    'logout_url' =>
                        'https://www.laregioncitoyenne.fr/auth/realms/laregioncitoyenne/protocol/openid-connect/logout'
                ]);

                break;
            case 'nantes':
                $this->connection->insert('sso_configuration', [
                    'id' => $this->generator->generate($this->em, null),
                    'name' => 'nantes-openid',
                    'enabled' => 1,
                    'ssoType' => 'oauth2',
                    'client_id' => '***REMOVED***',
                    'secret' => '***REMOVED***',
                    'authorization_url' => '***REMOVED***',
                    'access_token_url' => '***REMOVED***',
                    'user_info_url' => '***REMOVED***',
                    'logout_url' => '***REMOVED***'
                ]);

                break;
            default:
                break;
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE sso_configuration');
    }
}
