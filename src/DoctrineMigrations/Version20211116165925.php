<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Psr\Container\ContainerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211116165925 extends AbstractMigration implements ContainerAwareInterface
{
    protected ContainerInterface $container;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function getDescription(): string
    {
        return 'fos_user.set_unique_sso_id';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE fos_user CHANGE openid_id openid_id VARCHAR(512) DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957A64799BE8FD98 ON fos_user (facebook_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957A64799B95AF69 ON fos_user (openid_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957A64794DE18BA3 ON fos_user (france_connect_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_957A6479C63E6FFF ON fos_user (twitter_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_957A64799BE8FD98 ON fos_user');
        $this->addSql('DROP INDEX UNIQ_957A64799B95AF69 ON fos_user');
        $this->addSql('DROP INDEX UNIQ_957A64794DE18BA3 ON fos_user');
        $this->addSql('DROP INDEX UNIQ_957A6479C63E6FFF ON fos_user');
        $this->addSql(
            'ALTER TABLE fos_user CHANGE openid_id openid_id LONGTEXT CHARACTER SET utf8 DEFAULT NULL COLLATE `utf8_unicode_ci`'
        );
    }

    public function preUp(Schema $schema): void
    {
        if ('dev' === $this->container->get('kernel')->getEnvironment()) {
            $this->connection->update(
                'fos_user',
                ['facebook_id' => '153808779501692-duplicated'],
                ['id' => 'userJeanDuplicates']
            );
            $this->connection->update(
                'fos_user',
                [
                    'france_connect_id' =>
                        '3e3a3c86b26a5d67b015409f4ea2c0258f5014717136811eac432053bc2c9740v1-duplicated',
                ],
                ['id' => 'duplicatesUserConnectedFranceConnect']
            );
        }
    }
}
