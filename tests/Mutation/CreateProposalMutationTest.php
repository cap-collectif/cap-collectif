<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\GraphQL\Mutation\CreateProposalMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantIsMeetingRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\ViewerIsMeetingRequirementsResolver;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ProjectParticipantsTotalCountCacheHandler;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;

/**
 * @internal
 * @coversNothing
 */
class CreateProposalMutationTest extends TestCase
{
    public function testCreateProposalPublishesCreationMessage(): void
    {
        $proposalId = 'proposal1';
        $proposalFormId = 'proposalForm1';
        $step = $this->createMock(CollectStep::class);
        $step->method('getId')->willReturn('collectStep1');
        $step->method('getProject')->willReturn(null);

        $proposalForm = $this->createMock(ProposalForm::class);
        $proposalForm->method('getStep')->willReturn($step);

        $proposal = $this->createMock(Proposal::class);
        $proposal->method('getId')->willReturn($proposalId);

        $viewer = $this->createMock(User::class);
        $viewer->method('isConsentInternalCommunication')->willReturn(true);
        $viewer->method('getUsername')->willReturn('viewer');

        $em = $this->createMock(EntityManagerInterface::class);
        $em->expects($this->once())->method('flush');

        $proposalRepository = $this->createMock(ProposalRepository::class);
        $proposalRepository
            ->method('findCreatedSinceIntervalByAuthor')
            ->with($viewer, 'PT1M', 'author')
            ->willReturn([])
        ;
        $proposalRepository
            ->method('getProposalCountByStepAndContributor')
            ->with($step, $viewer)
            ->willReturn(2)
        ;

        $publisher = $this->createMock(Publisher::class);
        $publisher
            ->expects($this->once())
            ->method('publish')
            ->with(
                CapcoAppBundleMessagesTypes::PROPOSAL_CREATE,
                $this->callback(
                    fn (Message $message): bool => $message->getBody() === json_encode(['proposalId' => $proposalId])
                )
            )
        ;

        $viewerIsMeetingRequirementsResolver = $this->createMock(ViewerIsMeetingRequirementsResolver::class);
        $viewerIsMeetingRequirementsResolver->method('__invoke')->willReturn(true);

        $mutation = new class($this->createMock(LoggerInterface::class), $this->createMock(GlobalIdResolver::class), $em, $this->createMock(FormFactoryInterface::class), $this->createMock(ProposalFormRepository::class), $this->createMock(RedisStorageHelper::class), $this->createMock(ProposalFormProposalsDataLoader::class), $this->createMock(Indexer::class), $this->createMock(Manager::class), $this->createMock(ResponsesFormatter::class), $proposalRepository, $publisher, $this->createMock(ParticipantIsMeetingRequirementsResolver::class), $viewerIsMeetingRequirementsResolver, $this->createMock(ParticipantHelper::class), $this->createMock(ParticipantRepository::class), $this->createMock(ProjectParticipantsTotalCountCacheHandler::class), $this->createMock(TokenGeneratorInterface::class), ) extends CreateProposalMutation {
            public ProposalForm $proposalForm;
            public Proposal $proposal;

            /** @param array<string, mixed> $values */
            protected function getProposalForm(
                array $values,
                ?ContributorInterface $contributor = null
            ): ProposalForm {
                return $this->proposalForm;
            }

            /** @param array<string, mixed> $values */
            protected function createAndIndexProposal(
                array $values,
                ProposalForm $proposalForm,
                bool $draft,
                string $formType,
                ContributorInterface $contributor
            ): Proposal {
                return $this->proposal;
            }
        };
        $mutation->proposalForm = $proposalForm;
        $mutation->proposal = $proposal;

        $payload = $mutation(new Argument(['input' => [
            'proposalFormId' => $proposalFormId,
            'title' => 'A proposal',
        ]]), $viewer);

        self::assertFalse($payload['shouldTriggerWorkflow']);
    }
}
