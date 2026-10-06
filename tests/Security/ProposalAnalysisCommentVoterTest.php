<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\ProposalAnalysisComment;
use Capco\AppBundle\Security\ProposalAnalysisCommentVoter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class ProposalAnalysisCommentVoterTest extends AuthorizationTestCase
{
    public function testAnonymousCannotCreateAnalysisComment(): void
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn('anon.');

        self::assertSame(
            VoterInterface::ACCESS_DENIED,
            (new ProposalAnalysisCommentVoter())->vote($token, new ProposalAnalysisComment(), [ProposalAnalysisCommentVoter::CREATE])
        );
    }

    /** @dataProvider concernedViewers */
    public function testOnlyViewersConcernedByTheAnalysisCanCreateAComment(string $role, int $expected): void
    {
        $viewer = (new User())->setId('viewer-id');
        $other = (new User())->setId('other-user-id');
        $analysis = (new ProposalAnalysis());
        $proposal = new \Capco\AppBundle\Entity\Proposal();
        $analysis->setProposal($proposal);
        $analysis->setUpdatedBy('analyst' === $role ? $viewer : $other);
        if ('supervisor' === $role) {
            $proposal->setSupervisor(new \Capco\AppBundle\Entity\ProposalSupervisor($proposal, $viewer));
        } elseif ('decision maker' === $role) {
            $proposal->setProposalDecisionMaker(new \Capco\AppBundle\Entity\ProposalDecisionMaker($proposal, $viewer));
        } elseif ('assigned without analysis' === $role) {
            $proposal->addAnalysts([$viewer]);
        }
        $comment = (new ProposalAnalysisComment());
        $comment->setProposalAnalysis($analysis);
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($viewer);

        self::assertSame(
            $expected,
            (new ProposalAnalysisCommentVoter())->vote($token, $comment, [ProposalAnalysisCommentVoter::CREATE])
        );
    }

    /** @return iterable<string, array{string, int}> */
    public static function concernedViewers(): iterable
    {
        yield 'analyst who wrote the analysis' => ['analyst', VoterInterface::ACCESS_GRANTED];
        yield 'assigned supervisor' => ['supervisor', VoterInterface::ACCESS_GRANTED];
        yield 'assigned decision maker' => ['decision maker', VoterInterface::ACCESS_GRANTED];
        yield 'unrelated account' => ['other', VoterInterface::ACCESS_DENIED];
        yield 'analyst assigned without writing this analysis' => ['assigned without analysis', VoterInterface::ACCESS_DENIED];
    }
}
