<?php

namespace Capco\Tests\Repository;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadata;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class ReplyAnonymousRepositoryTest extends KernelTestCase
{
    private EntityManagerInterface $entityManager;

    private ReplyAnonymousRepository $replyAnonymousRepository;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();

        $this->entityManager = $kernel->getContainer()
            ->get('doctrine')
            ->getManager()
        ;

        $this->replyAnonymousRepository = new ReplyAnonymousRepository($this->entityManager, new ClassMetadata(ReplyAnonymous::class));
    }

    public function testGetQuestionnaireAnonymousRepliesReturnsDistinctEmails(): void
    {
        $questionnaire = $this->entityManager->getRepository(Questionnaire::class)->find('questionnaireAnonymous');

        $results = $this->replyAnonymousRepository->getQuestionnaireAnonymousRepliesWithDistinctEmails($questionnaire, 0, 10);

        $this->assertCount(1, $results);
        $this->assertContainsOnly(ReplyAnonymous::class, $results);
        $this->assertSame('abc@cap-collectif.com', $results[0]->getParticipantEmail());
    }
}
