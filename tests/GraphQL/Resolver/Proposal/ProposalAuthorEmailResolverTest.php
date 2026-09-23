<?php

namespace Capco\Tests\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalAuthorEmailResolver;
use Capco\AppBundle\Security\ProposalVoter;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * @internal
 * @coversNothing
 */
class ProposalAuthorEmailResolverTest extends TestCase
{
    public function testReturnsEmailOnlyForProposalEditors(): void
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
        $proposal->expects(self::once())->method('getAuthor')->willReturn($author);
        self::assertSame('author@example.test', (new ProposalAuthorEmailResolver($authorizationChecker))($proposal));
    }

    public function testDoesNotReadEmailWhenViewerCannotEditProposal(): void
    {
        $proposal = $this->createMock(Proposal::class);
        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker
            ->expects(self::once())
            ->method('isGranted')
            ->with(ProposalVoter::EDIT, $proposal)
            ->willReturn(false)
        ;
        $proposal->expects(self::never())->method('getAuthor');

        self::assertNull((new ProposalAuthorEmailResolver($authorizationChecker))($proposal));
    }
}
