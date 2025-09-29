<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Event\CommentChangedEvent;
use Capco\AppBundle\Form\CommentType;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\DataLoader\Commentable\CommentableCommentsDataLoader;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Form\FormFactoryInterface;

class AddCommentMutation implements MutationInterface
{
    use MutationTrait;

    final public const ERROR_NOT_FOUND_COMMENTABLE = 'Commentable not found.';
    final public const ERROR_NOT_COMMENTABLE = 'Can\'t add a comment to a not commentable.';
    final public const ERROR_NEW_COMMENTS_NOT_ACCEPTED = 'Comment\'s are not longer accepted';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly FormFactoryInterface $formFactory,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly LoggerInterface $logger,
        private readonly EventDispatcherInterface $eventDispatcher,
        private readonly CommentableCommentsDataLoader $commentableCommentsDataLoader,
        private readonly RequestGuesserInterface $requestGuesser,
        private readonly Manager $manager,
        private readonly TokenGeneratorInterface $tokenGenerator
    ) {
    }

    public function __invoke(Arg $input, /*User|string*/ $viewer): array
    {
        $this->formatInput($input);
        $commentableGlobalId = $input->offsetGet('commentableId');
        $commentableId = GlobalId::fromGlobalId($commentableGlobalId)['id'];
        $commentable = $this->globalIdResolver->resolve($commentableGlobalId, $viewer);

        if (!$commentable || !$commentable instanceof CommentableInterface) {
            $this->logger->error('Unknown commentable with id: ' . $commentableId);

            return ['userErrors' => [['message' => self::ERROR_NOT_FOUND_COMMENTABLE]]];
        }

        if (!$commentable->isCommentable()) {
            $this->logger->error(
                'Can\'t add an comment to a not commentable with id: ' . $commentableId
            );

            return ['userErrors' => [['message' => self::ERROR_NOT_COMMENTABLE]]];
        }

        if (!$commentable->acceptNewComments()) {
            $this->logger->error(
                'Commentable with id: ' . $commentableId . ' doesnt accept new comments.'
            );

            return ['userErrors' => [['message' => self::ERROR_NEW_COMMENTS_NOT_ACCEPTED]]];
        }

        $comment = null;
        $relatedCommentInstance = $commentable;
        if ($commentable instanceof Comment) {
            $relatedCommentInstance = $commentable->getRelatedObject();
        }

        if ($relatedCommentInstance instanceof Proposal) {
            $comment = new ProposalComment();
        }
        if ($relatedCommentInstance instanceof Event) {
            $comment = new EventComment();
        }
        if ($relatedCommentInstance instanceof Post) {
            $comment = new PostComment();
        }

        $isModerationEnabled = $this->manager->isActive(Manager::moderation_comment);

        $comment
            ->setAuthor($viewer)
            ->setAuthorIp($this->requestGuesser->getClientIp())
            ->setRelatedObject($relatedCommentInstance)
            ->setParent($commentable instanceof Comment ? $commentable : null)
        ;

        $this->setModerationStatus($comment, $isModerationEnabled, $viewer);

        if (!$viewer && $isModerationEnabled) {
            $token = $this->tokenGenerator->generateToken();
            $comment->setConfirmationToken($token);
        }

        $values = $input->getArrayCopy();
        unset($values['commentableId']);
        $form = $this->formFactory->create(CommentType::class, $comment);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->persist($comment);
        $this->em->flush();
        $this->commentableCommentsDataLoader->invalidate($commentableGlobalId);
        $edge = new Edge(ConnectionBuilder::offsetToCursor(0), $comment);

        $this->eventDispatcher->dispatch(
            new CommentChangedEvent($comment, 'add'),
            CapcoAppBundleEvents::COMMENT_CHANGED
        );

        if (!$viewer && $isModerationEnabled) {
            $this->eventDispatcher->dispatch(
                new CommentChangedEvent($comment, 'confirm_anonymous_email'),
                CapcoAppBundleEvents::COMMENT_CHANGED
            );
        }

        return ['commentEdge' => $edge, 'userErrors' => []];
    }

    private function setModerationStatus(
        Comment $comment,
        bool $isModerationEnabled,
        ?User $viewer = null
    ): void {
        if (!$isModerationEnabled) {
            $comment->approve();

            return;
        }

        if (!$viewer) {
            return;
        }

        if ($viewer->isAdmin()) {
            $comment->approve();

            return;
        }

        $doesRelatedObjectBelongsToProjectAdmin = $comment->doesRelatedObjectBelongsToProjectAdmin(
            $viewer
        );
        if ($doesRelatedObjectBelongsToProjectAdmin) {
            $comment->approve();

            return;
        }

        $comment->setPending();
    }
}
