<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\DataLoader\Commentable\CommentableCommentsDataLoader;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Form\CommentType;
use Capco\AppBundle\Entity\PostComment;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\Entity\EventComment;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Event\CommentChangedEvent;
use Capco\AppBundle\Model\CommentableInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class AddCommentMutation implements MutationInterface
{
    public const ERROR_NOT_FOUND_COMMENTABLE = 'Commentable not found.';
    public const ERROR_NOT_COMMENTABLE = 'Can\'t add a comment to a not commentable.';
    public const ERROR_NEW_COMMENTS_NOT_ACCEPTED = 'Comment\'s are not longer accepted';
    private $em;
    private $globalIdResolver;
    private $formFactory;
    private $logger;
    private $eventDispatcher;
    private $commentableCommentsDataLoader;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver,
        LoggerInterface $logger,
        EventDispatcherInterface $dispatcher,
        CommentableCommentsDataLoader $commentableCommentsDataLoader
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
        $this->logger = $logger;
        $this->eventDispatcher = $dispatcher;
        $this->commentableCommentsDataLoader = $commentableCommentsDataLoader;
    }

    public function __invoke(Arg $input, /*User|string*/ $viewer, RequestStack $requestStack): array
    {
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

        $comment
            ->setAuthor($viewer)
            ->setAuthorIp($requestStack->getCurrentRequest()->getClientIp())
            ->setRelatedObject($relatedCommentInstance)
            ->setParent($commentable instanceof Comment ? $commentable : null);

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
            CapcoAppBundleEvents::COMMENT_CHANGED,
            new CommentChangedEvent($comment, 'add')
        );

        return ['commentEdge' => $edge, 'userErrors' => []];
    }
}
