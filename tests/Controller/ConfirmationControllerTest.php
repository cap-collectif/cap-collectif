<?php

namespace Capco\Tests\Controller;

use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Service\Encryptor;
use Capco\UserBundle\Controller\ConfirmationController;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;

/**
 * @internal
 * @coversNothing
 */
class ConfirmationControllerTest extends KernelTestCase
{
    public function testKeepsProposalResponsesWhenConfirmingAnExistingParticipantEmail(): void
    {
        self::bootKernel();
        $container = self::getContainer();
        $em = $container->get('doctrine')->getManager();
        $connection = $em->getConnection();
        $connection->beginTransaction();

        $listener = $container->get(ElasticsearchDoctrineListener::class);
        $em->getEventManager()->removeEventListener($listener->getSubscribedEvents(), $listener);
        $container->set(Indexer::class, $this->createMock(Indexer::class));

        try {
            $existingParticipant = $em->find(Participant::class, 'participant1');
            self::assertInstanceOf(Participant::class, $existingParticipant);
            self::assertFalse($existingParticipant->getReplies()->isEmpty());
            $existingParticipant->setConfirmationToken(null);

            $participant = (new Participant())
                ->setToken('proposal-confirmation-test')
                ->setConfirmationToken('proposal-confirmation-test')
                ->setNewEmailConfirmationToken('proposal-confirmation-test')
                ->setNewEmailToConfirm($existingParticipant->getEmail())
            ;
            $em->persist($participant);

            $proposal = $em->find(Proposal::class, 'proposal2');
            self::assertInstanceOf(Proposal::class, $proposal);
            $proposal->setContributor($participant);
            $participant->addProposal($proposal);
            foreach ($proposal->getResponses() as $response) {
                $response->setContributor($participant);
            }
            $em->flush();
            $participantId = $participant->getId();

            $responsesBeforeConfirmation = $connection->fetchAllAssociative(
                'SELECT id, value FROM response WHERE proposal_id = ? ORDER BY id',
                [$proposal->getId()]
            );
            self::assertNotEmpty($responsesBeforeConfirmation);

            $encryptor = $container->get(Encryptor::class);
            $request = new Request([
                'participationCookies' => $encryptor->encryptData(json_encode([
                    'replyCookie' => null,
                    'participantCookie' => $encryptor->encryptData(base64_encode($participant->getToken())),
                ], \JSON_THROW_ON_ERROR)),
            ]);
            $controller = $container->get(ConfirmationController::class);
            $response = $controller->confirmEmailParticipantAction($request, 'proposal-confirmation-test');

            self::assertTrue($response->isRedirection());
            self::assertSame($existingParticipant, $proposal->getParticipant());
            self::assertSame(
                $responsesBeforeConfirmation,
                $connection->fetchAllAssociative(
                    'SELECT id, value FROM response WHERE proposal_id = ? ORDER BY id',
                    [$proposal->getId()]
                ),
                'Confirming an existing email must preserve the proposal custom field responses.'
            );
            self::assertSame(
                [$existingParticipant->getId()],
                $connection->fetchFirstColumn(
                    'SELECT DISTINCT participant_id FROM response WHERE proposal_id = ?',
                    [$proposal->getId()]
                )
            );
            self::assertFalse($connection->fetchOne('SELECT id FROM participant WHERE id = ?', [$participantId]));
        } finally {
            $connection->rollBack();
            $em->clear();
        }
    }
}
