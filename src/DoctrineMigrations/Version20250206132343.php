<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class Version20250206132343 extends AbstractMigration implements ContainerAwareInterface
{
    private UuidGenerator $generator;
    private EntityManagerInterface $em;

    public function setContainer(?ContainerInterface $container = null): void
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function getDescription(): string
    {
        return 'add participant_id to emailing_campaign_user';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE emailing_campaign_user DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE emailing_campaign_user ADD id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', ADD participant_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', CHANGE user_id user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE emailing_campaign_user ADD CONSTRAINT FK_4E275AFA9D1C3019 FOREIGN KEY (participant_id) REFERENCES participant (id)');
        $this->addSql('CREATE INDEX IDX_4E275AFA9D1C3019 ON emailing_campaign_user (participant_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE emailing_campaign_user DROP FOREIGN KEY FK_4E275AFA9D1C3019');
        $this->addSql('DROP INDEX IDX_4E275AFA9D1C3019 ON emailing_campaign_user');
        $this->addSql('ALTER TABLE emailing_campaign_user DROP PRIMARY KEY');
        $this->addSql('ALTER TABLE emailing_campaign_user DROP id, DROP participant_id, CHANGE user_id user_id CHAR(36) CHARACTER SET utf8 NOT NULL COLLATE `utf8_unicode_ci` COMMENT \'(DC2Type:guid)\'');
        $this->addSql('ALTER TABLE emailing_campaign_user ADD PRIMARY KEY (emailing_campaign_id, user_id)');
        $this->addSql('ALTER TABLE step ADD is_proposal_sms_vote_enabled TINYINT(1) DEFAULT NULL, ADD collect_participants_email TINYINT(1) DEFAULT \'0\'');
    }

    public function postUp(Schema $schema): void
    {
        $table = 'emailing_campaign_user';
        $rows = $this->connection->fetchAllAssociative('SELECT emailing_campaign_id, user_id from ' . $table);
        if (\count($rows) > 0) {
            $this->write('-> Generating ' . \count($rows) . ' UUID(s)...');
            foreach ($rows as $row) {
                $emailingCampaignId = $row['emailing_campaign_id'];
                $userId = $row['user_id'];
                $uuid = $this->generator->generate($this->em, null);
                $this->connection->update(
                    $table,
                    ['id' => $uuid],
                    ['emailing_campaign_id' => $emailingCampaignId, 'user_id' => $userId]
                );
            }
        }
        $this->connection->executeQuery('ALTER TABLE emailing_campaign_user ADD PRIMARY KEY (id)');
    }
}
