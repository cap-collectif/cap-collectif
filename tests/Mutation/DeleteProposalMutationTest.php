<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\GraphQL\Mutation\DeleteProposalMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalAccessResolver;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

/**
 * @internal
 * @coversNothing
 */
class DeleteProposalMutationTest extends TestCase
{
    private MockObject & EntityManagerInterface $em;
    private MockObject & RedisStorageHelper $redisHelper;
    private MockObject & Publisher $publisher;
    private MockObject & Indexer $indexer;
    private MockObject & ProposalFormProposalsDataLoader $dataloader;
    private MockObject & GlobalIdResolver $globalIdResolver;
    private MockObject & ProposalAccessResolver $proposalAccessResolver;

    private DeleteProposalMutation $deleteProposalMutation;

    protected function setUp(): void
    {
        $this->em = $this->createMock(EntityManagerInterface::class);
        $this->redisHelper = $this->createMock(RedisStorageHelper::class);
        $this->publisher = $this->createMock(Publisher::class);
        $this->indexer = $this->createMock(Indexer::class);
        $this->dataloader = $this->createMock(ProposalFormProposalsDataLoader::class);
        $this->globalIdResolver = $this->createMock(GlobalIdResolver::class);
        $this->proposalAccessResolver = $this->createMock(ProposalAccessResolver::class);

        $this->deleteProposalMutation = new DeleteProposalMutation(
            $this->em,
            $this->redisHelper,
            $this->publisher,
            $this->indexer,
            $this->dataloader,
            $this->globalIdResolver,
            $this->proposalAccessResolver,
        );
    }

    public function testDeleteProposalPublishesMessageWithSupervisorAndDecisionMaker(): void
    {
        $proposalId = 'UHJvcG9zYWw6cHJvcG9zYWwxMTA=';
        $internalProposalId = 'proposal110';
        $supervisorId = 'userSupervisor';
        $decisionMakerId = 'userDecisionMaker';

        $user = $this->createMock(User::class);
        $author = $this->createMock(User::class);
        $supervisor = $this->createMock(User::class);
        $decisionMaker = $this->createMock(User::class);
        $proposal = $this->createMock(Proposal::class);
        $proposalForm = $this->createMock(ProposalForm::class);
        $step = $this->createMock(CollectStep::class);

        $supervisor->method('getId')->willReturn($supervisorId);
        $decisionMaker->method('getId')->willReturn($decisionMakerId);

        $proposal->method('getId')->willReturn($internalProposalId);
        $proposal->method('getAuthor')->willReturn($author);
        $proposal->method('getSupervisor')->willReturn($supervisor);
        $proposal->method('getDecisionMaker')->willReturn($decisionMaker);
        $proposal->method('getProposalForm')->willReturn($proposalForm);

        $proposalForm->method('getStep')->willReturn($step);

        $this->globalIdResolver
            ->method('resolve')
            ->with($proposalId, $user)
            ->willReturn($proposal)
        ;

        $this->proposalAccessResolver
            ->method('__invoke')
            ->with($proposal, self::isInstanceOf(Argument::class), $user)
            ->willReturn(['canDelete' => true])
        ;

        $expectedMessage = json_encode([
            'proposalId' => $internalProposalId,
            'supervisorId' => $supervisorId,
            'decisionMakerId' => $decisionMakerId,
        ]);

        $this->publisher
            ->expects($this->once())
            ->method('publish')
            ->with(
                'proposal.delete',
                self::callback(fn (Message $message) => $message->getBody() === $expectedMessage)
            )
        ;

        $this->deleteProposalMutation->__invoke($proposalId, $user);
    }

    public function testDeleteProposalPublishesMessageWithoutSupervisorAndDecisionMaker(): void
    {
        $proposalId = 'UHJvcG9zYWw6cHJvcG9zYWwxMg==';
        $internalProposalId = 'proposal12';

        $user = $this->createMock(User::class);
        $author = $this->createMock(User::class);
        $proposal = $this->createMock(Proposal::class);
        $proposalForm = $this->createMock(ProposalForm::class);
        $step = $this->createMock(CollectStep::class);

        $proposal->method('getId')->willReturn($internalProposalId);
        $proposal->method('getAuthor')->willReturn($author);
        $proposal->method('getSupervisor')->willReturn(null);
        $proposal->method('getDecisionMaker')->willReturn(null);
        $proposal->method('getProposalForm')->willReturn($proposalForm);

        $proposalForm->method('getStep')->willReturn($step);

        $this->globalIdResolver
            ->method('resolve')
            ->with($proposalId, $user)
            ->willReturn($proposal)
        ;

        $this->proposalAccessResolver
            ->method('__invoke')
            ->with($proposal, self::isInstanceOf(Argument::class), $user)
            ->willReturn(['canDelete' => true])
        ;

        $expectedMessage = json_encode([
            'proposalId' => $internalProposalId,
            'supervisorId' => null,
            'decisionMakerId' => null,
        ]);

        $this->publisher
            ->expects($this->once())
            ->method('publish')
            ->with(
                'proposal.delete',
                self::callback(fn (Message $message) => $message->getBody() === $expectedMessage)
            )
        ;

        $this->deleteProposalMutation->__invoke($proposalId, $user);
    }
}
