<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\DBAL\Enum\MailerType;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20211201175715 extends AbstractMigration implements ContainerAwareInterface
{
    public array $invitations = [];
    private EntityManagerInterface $em;
    private readonly UuidGenerator $generator;

    public function __construct(Connection $connection, LoggerInterface $logger)
    {
        parent::__construct($connection, $logger);
        $this->generator = new UuidGenerator();
    }

    public function setContainer(?ContainerInterface $container = null): void
    {
        $this->em = $container->get('doctrine')->getManager();
    }

    public function getDescription(): string
    {
        return 'Create UserInviteEmailMessage table and generate one for each existing invitation.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            'CREATE TABLE user_invite_email_message (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', invitation_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', mailer_id VARCHAR(255) DEFAULT NULL, mailer_type ENUM(\'mailjet\', \'mandrill\', \'smtp\') COMMENT \'(DC2Type:enum_mailer_type)\' NOT NULL COMMENT \'(DC2Type:enum_mailer_type)\', created_at DATETIME NOT NULL, internal_status VARCHAR(255) NOT NULL, INDEX IDX_43824700A35D7AF0 (invitation_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE user_invite_email_message ADD CONSTRAINT FK_43824700A35D7AF0 FOREIGN KEY (invitation_id) REFERENCES user_invite (id) ON DELETE CASCADE'
        );
    }

    public function postUp(Schema $schema): void
    {
        $this->invitations = $this->connection->fetchAllAssociative(
            'SELECT id, mailjet_id, mandrill_id, internal_status, created_at FROM user_invite AS ui'
        );
        foreach ($this->invitations as $invitation) {
            if ($invitation['mailjet_id']) {
                $mailerType = MailerType::MAILJET;
                $mailerId = $invitation['mailjet_id'];
            } elseif ($invitation['mandrill_id']) {
                $mailerType = MailerType::MANDRILL;
                $mailerId = $invitation['mandrill_id'];
            } else {
                $mailerType = MailerType::SMTP;
                $mailerId = null;
            }

            $emailMessageData = [
                'id' => $this->generator->generate($this->em, null),
                'invitation_id' => $invitation['id'],
                'mailer_id' => $mailerId,
                'mailer_type' => $mailerType,
                'internal_status' => $invitation['internal_status'],
                'created_at' => $invitation['created_at'],
            ];
            $this->connection->insert('user_invite_email_message', $emailMessageData);
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE user_invite_email_message');
    }
}
