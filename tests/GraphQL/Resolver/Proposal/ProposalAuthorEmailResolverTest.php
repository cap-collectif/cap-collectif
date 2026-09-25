<?php

namespace Capco\Tests\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalAuthorEmailResolver;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\AppBundle\Security\ProposalVoter;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * @internal
 * @coversNothing
 */
class ProposalAuthorEmailResolverTest extends TestCase
{
    public function testReturnsEmailForProposalEditorsWhenRevisionsAreDisabled(): void
    {
        $proposal = $this->createMock(Proposal::class);
        $author = (new User())->setEmail('author@example.test');
        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker
            ->expects(self::once())
            ->method('isGranted')
            ->with(ProposalVoter::EDIT, $proposal)
            ->willReturn(true)
        ;
        $manager = $this->createMock(Manager::class);
        $manager->expects(self::never())->method('isActive');
        $proposal->expects(self::once())->method('getAuthor')->willReturn($author);
        self::assertSame('author@example.test', (new ProposalAuthorEmailResolver($authorizationChecker, $manager))($proposal));
    }

    public function testDoesNotReadEmailForRevisionRequestersWhenRevisionsAreDisabled(): void
    {
        $proposal = $this->createMock(Proposal::class);
        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker
            ->expects(self::once())
            ->method('isGranted')
            ->with(ProposalVoter::EDIT, $proposal)
            ->willReturn(false)
        ;
        $manager = $this->createMock(Manager::class);
        $manager
            ->expects(self::once())
            ->method('isActive')
            ->with(Manager::proposal_revisions)
            ->willReturn(false)
        ;
        $proposal->expects(self::never())->method('getAuthor');

        self::assertNull((new ProposalAuthorEmailResolver($authorizationChecker, $manager))($proposal));
    }

    public function testReturnsEmailForRevisionRequestersWhenRevisionsAreEnabled(): void
    {
        $proposal = $this->createMock(Proposal::class);
        $author = (new User())->setEmail('author@example.test');
        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker
            ->expects(self::exactly(2))
            ->method('isGranted')
            ->willReturnMap([
                [ProposalVoter::EDIT, $proposal, false],
                [ProposalAnalysisRelatedVoter::REVISE, $proposal, true],
            ])
        ;
        $manager = $this->createMock(Manager::class);
        $manager->method('isActive')->with(Manager::proposal_revisions)->willReturn(true);
        $proposal->expects(self::once())->method('getAuthor')->willReturn($author);

        self::assertSame('author@example.test', (new ProposalAuthorEmailResolver($authorizationChecker, $manager))($proposal));
    }
}
