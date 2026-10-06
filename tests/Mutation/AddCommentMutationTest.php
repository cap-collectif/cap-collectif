<?php

namespace Capco\Tests\Mutation;

use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class AddCommentMutationTest extends IdentityWebTestCase
{
    /** @dataProvider commentStates */
    public function testAnonymousCommentsArePersistedOnlyWhenTheTargetAcceptsThem(string $kind, ?string $error): void
    {
        $form = $this->em->getRepository(\Capco\AppBundle\Entity\ProposalForm::class)->findOneBy([]);
        $form->setCommentable('closed' !== $kind);
        $proposal = (new \Capco\AppBundle\Entity\Proposal())->setProposalForm($form)->setAuthor($this->account())->setTitle('Comment target')->setBody('Public content')->setDraft(false)->setPublishedAt(new \DateTime('2020-01-01'))->setCommentable('disabled' !== $kind);
        $this->em->persist($proposal);
        $this->em->flush();
        $id = $proposal->getId();
        $this->setFeature('moderation_comment', true);
        $targetId = GlobalId::toGlobalId('Proposal', 'missing' === $kind ? 'missing' : $id);
        $result = $this->graphql('mutation($input: AddCommentInput!) { addComment(input: $input) { userErrors { message } commentEdge { node { id } } } }', ['input' => ['commentableId' => $targetId, 'body' => 'An anonymous comment', 'authorName' => 'Anonymous author', 'authorEmail' => 'author@gmail.com']])['addComment'];
        self::assertSame(null === $error ? [] : [['message' => $error]], $result['userErrors']);
        $this->em->clear();
        $comments = $this->em->getRepository(\Capco\AppBundle\Entity\ProposalComment::class)->findBy(['proposal' => $id]);
        self::assertCount(null === $error ? 1 : 0, $comments);
        if (null === $error) {
            self::assertSame('An anonymous comment', $comments[0]->getBody());
            self::assertNull($comments[0]->getAuthor());
            self::assertNotEmpty($comments[0]->getConfirmationToken());
            self::assertSame(GlobalId::toGlobalId('Comment', $comments[0]->getId()), $result['commentEdge']['node']['id']);
        } else {
            self::assertNull($result['commentEdge']);
            self::assertSame([], $this->messages);
        }
    }

    /** @dataProvider authenticatedCommenters */
    public function testAuthenticatedCommentsKeepTheirAuthorAndModerationStatus(string $role, bool $moderated, string $status): void
    {
        $viewer = $this->account()->addRole($role);
        $viewerId = $viewer->getId();
        $form = $this->em->getRepository(\Capco\AppBundle\Entity\ProposalForm::class)->findOneBy([]);
        $form->setCommentable(true);
        $proposal = (new \Capco\AppBundle\Entity\Proposal())->setProposalForm($form)->setAuthor($this->account())->setTitle('Authenticated comment target')->setBody('Public content')->setDraft(false)->setPublishedAt(new \DateTime('2020-01-01'))->setCommentable(true);
        $this->em->persist($proposal);
        $this->em->flush();
        $proposalId = $proposal->getId();
        $this->setFeature('moderation_comment', $moderated);
        $this->login($viewer->getEmail());

        $result = $this->graphql('mutation($input: AddCommentInput!) { addComment(input: $input) { userErrors { message } commentEdge { node { id } } } }', ['input' => ['commentableId' => GlobalId::toGlobalId('Proposal', $proposalId), 'body' => 'An authenticated comment']])['addComment'];

        self::assertSame([], $result['userErrors']);
        $this->em->clear();
        $comments = $this->em->getRepository(\Capco\AppBundle\Entity\ProposalComment::class)->findBy(['proposal' => $proposalId]);
        self::assertCount(1, $comments);
        self::assertSame('An authenticated comment', $comments[0]->getBody());
        self::assertSame($viewerId, $comments[0]->getAuthor()->getId());
        self::assertSame($status, $comments[0]->getModerationStatus());
        self::assertNull($comments[0]->getConfirmationToken());
        self::assertSame(GlobalId::toGlobalId('Comment', $comments[0]->getId()), $result['commentEdge']['node']['id']);
    }

    /** @return iterable<string, array{string, bool, string}> */
    public static function authenticatedCommenters(): iterable
    {
        yield 'ordinary account without moderation' => ['ROLE_USER', false, 'APPROVED'];
        yield 'ordinary account awaiting moderation' => ['ROLE_USER', true, 'PENDING'];
        yield 'administrator bypasses moderation' => ['ROLE_ADMIN', true, 'APPROVED'];
    }

    /** @return iterable<string, array{string, ?string}> */
    public static function commentStates(): iterable
    {
        yield 'accepted anonymous comment' => ['open', null];
        yield 'missing target' => ['missing', 'Commentable not found.'];
        yield 'comments disabled' => ['disabled', "Can't add a comment to a not commentable."];
        yield 'new comments closed' => ['closed', "Comment's are not longer accepted"];
    }
}
