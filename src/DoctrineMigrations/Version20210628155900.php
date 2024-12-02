<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20210628155900 extends AbstractMigration implements ContainerAwareInterface
{
    private ?ContainerInterface $container = null;
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
        return 'sender_email';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'CREATE TABLE sender_email (
                id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\',
                domain VARCHAR(255) NOT NULL,
                locale VARCHAR(255) NOT NULL,
                is_default TINYINT(1) DEFAULT \'0\' NOT NULL,
                UNIQUE INDEX UNIQ_F8B715EC4180C698A7A91E0B (locale, domain),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE sender_email');
    }

    public function postUp(Schema $schema): void
    {
        $defaultSenderEmail = $this->getCurrentSenderEmail();
        $this->createEmail(
            explode('@', $defaultSenderEmail)[0],
            explode('@', $defaultSenderEmail)[1],
            true
        );

        if ('assistance@cap-collectif.com' !== $defaultSenderEmail) {
            $this->createEmail('assistance', 'cap-collectif.com');
        }
    }

    private function createEmail(string $locale, string $domain, bool $isDefault = false): void
    {
        $this->connection->insert('sender_email', [
            'id' => $this->generator->generate($this->em, null),
            'locale' => $locale,
            'domain' => $domain,
            'is_default' => $isDefault ? 1 : 0,
        ]);
    }

    private function getCurrentSenderEmail(): string
    {
        return $this->connection->fetchOne(
            'SELECT value FROM site_parameter WHERE keyname= :keyname',
            ['keyname' => 'admin.mail.notifications.send_address']
        );
    }
}
