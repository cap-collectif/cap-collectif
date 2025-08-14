<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250310132930 extends AbstractMigration implements ContainerAwareInterface
{
    private EntityManagerInterface $em;

    public function getDescription(): string
    {
        return 'move reply_anonymous fields to reply and migrate data';
    }

    public function setContainer(?ContainerInterface $container = null): void
    {
        $this->em = $container->get('doctrine')->getManager();
    }

    public function up(Schema $schema): void
    {
        $participantRepository = $this->em->getRepository(Participant::class);
        $questionnaireRepository = $this->em->getRepository(Questionnaire::class);
        $anonReplies = $this->connection->fetchAllAssociative('SELECT * FROM reply_anonymous');

        $tokens = [];
        foreach ($anonReplies as $anonReply) {
            $token = $anonReply['token'];
            if (\in_array($token, $tokens, true)) {
                continue;
            }
            $participant = (new Participant())
                ->setToken($token)
                ->setEmail($anonReply['participant_email'])
                ->setCreatedAt(new \Datetime($anonReply['created_at']))
                ->setLastContributedAt(new \Datetime($anonReply['created_at']))
            ;
            $tokens[] = $token;
            $this->em->persist($participant);
        }

        $this->em->flush();

        foreach ($anonReplies as $anonReply) {
            $token = $anonReply['token'];
            $participant = $participantRepository->findOneBy(['token' => $token]);
            $questionnaire = $questionnaireRepository->find($anonReply['questionnaire_id']);
            $reply = (new Reply())
                ->setId($anonReply['id'])
                ->setQuestionnaire($questionnaire)
                ->setParticipant($participant)
                ->setCreatedAt(new \Datetime($anonReply['created_at']))
            ;
            $this->em->persist($reply);
        }

        $this->em->flush();

        $this->addSql('ALTER TABLE response DROP FOREIGN KEY FK_3E7B0BFBEAFE8437');
        $this->addSql('DROP TABLE reply_anonymous');
        $this->addSql('DROP INDEX IDX_3E7B0BFBEAFE8437 ON response');
        $this->addSql('ALTER TABLE response DROP reply_anonymous_id');
    }

    public function down(Schema $schema): void
    {
    }
}
