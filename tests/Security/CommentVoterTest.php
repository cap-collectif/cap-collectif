<?php

namespace Capco\Tests\Security;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Security\CommentVoter;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class CommentVoterTest extends AuthorizationTestCase
{
    public function testAnonymousCannotDeleteComment(): void
    {
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn('anon.');

        self::assertSame(VoterInterface::ACCESS_DENIED, (new CommentVoter())->vote($token, (new \Capco\AppBundle\Entity\ProposalComment()), [CommentVoter::DELETE]));
    }

    public function testNonAuthorCannotDeleteComment(): void
    {
        $viewer = (new User());

        $author = (new User());
        $comment = (new \Capco\AppBundle\Entity\ProposalComment());
        $comment->setAuthor($author);
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($viewer);

        self::assertSame(VoterInterface::ACCESS_DENIED, (new CommentVoter())->vote($token, $comment, [CommentVoter::DELETE]));
    }

    public function testAuthorCanDeleteComment(): void
    {
        $viewer = (new User());
        $comment = (new \Capco\AppBundle\Entity\ProposalComment());
        $comment->setAuthor($viewer);
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($viewer);

        self::assertSame(VoterInterface::ACCESS_GRANTED, (new CommentVoter())->vote($token, $comment, [CommentVoter::DELETE]));
    }

    public function testAdminCanDeleteComment(): void
    {
        $viewer = (new User());
        $viewer->addRole('ROLE_ADMIN');
        $comment = (new \Capco\AppBundle\Entity\ProposalComment());
        $comment->setAuthor(null);
        $token = $this->createStub(TokenInterface::class);
        $token->method('getUser')->willReturn($viewer);

        self::assertSame(VoterInterface::ACCESS_GRANTED, (new CommentVoter())->vote($token, $comment, [CommentVoter::DELETE]));
    }

    public function testAbstainsForUnsupportedSubjectAndAttribute(): void
    {
        $token = $this->createStub(TokenInterface::class);

        self::assertSame(VoterInterface::ACCESS_ABSTAIN, (new CommentVoter())->vote($token, new Post(), ['update']));
    }
}
