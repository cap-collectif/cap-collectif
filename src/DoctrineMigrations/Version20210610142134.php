<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20210610142134 extends AbstractMigration implements ContainerAwareInterface
{
    private EntityManagerInterface $entityManager;
    private UuidGenerator $uuidGenerator;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->entityManager = $container->get('doctrine')->getManager();
        $this->uuidGenerator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'SenderEmailDomain';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            "CREATE TABLE sender_email_domain (
                id CHAR(36) NOT NULL COMMENT '(DC2Type:guid)',
                value VARCHAR(255) NOT NULL,
                service VARCHAR(255) NOT NULL,
                UNIQUE INDEX UNIQ_28B44C8F1D775834E19D9AD2 (value, service),
                PRIMARY KEY(id)
            )
            DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci`
            ENGINE = InnoDB"
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE sender_email_domain');
    }

    public function postUp(Schema $schema): void
    {
        $this->addDefaultSenderEmailDomain();
        $this->addCurrentSenderEmailDomainIfDifferent();
    }

    private function addDefaultSenderEmailDomain(): void
    {
        $this->addSenderEmailDomain('cap-collectif.com', 'mandrill');
        $this->addSenderEmailDomain('cap-collectif.com', 'mailjet');
    }

    private function addCurrentSenderEmailDomainIfDifferent(): void
    {
        $senderDomain = $this->getCurrentSenderEmailDomain();
        if ('cap-collectif.com' !== $senderDomain) {
            $this->addSenderEmailDomain($senderDomain, $this->getCurrentMailer());
        }
    }

    private function addSenderEmailDomain(string $value, string $service): void
    {
        $this->connection->insert('sender_email_domain', [
            'id' => $this->generateUuid(),
            'value' => $value,
            'service' => $service,
        ]);
    }

    private function getCurrentSenderEmailDomain(): string
    {
        $senderEmail = $this->connection->fetchOne(
            'SELECT value FROM site_parameter WHERE keyname= :keyname',
            ['keyname' => 'admin.mail.notifications.send_address']
        );

        return explode('@', $senderEmail)[1];
    }

    private function getCurrentMailer(): string
    {
        return $this->connection->fetchOne(
            'SELECT value FROM external_site_configuration WHERE type = :type',
            ['type' => 'mailer']
        );
    }

    private function generateUuid(): string
    {
        return $this->uuidGenerator->generate($this->entityManager, null);
    }
}
