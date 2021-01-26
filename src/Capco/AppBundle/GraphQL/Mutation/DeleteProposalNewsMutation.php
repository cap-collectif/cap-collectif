<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class DeleteProposalNewsMutation implements MutationInterface
{
    public const POST_NOT_FOUND = 'POST_NOT_FOUND';
    public const ACCESS_DENIED = 'ACCESS_DENIED';

    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;
    private LoggerInterface $logger;
    private Publisher $publisher;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        LoggerInterface $logger,
        Publisher $publisher
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->logger = $logger;
        $this->publisher = $publisher;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        try {
            $proposalPost = $this->getPost($input, $viewer);
            $id = $input->offsetGet('postId');
            $this->em->remove($proposalPost);
            $proposalName = $proposalPost
                ->getProposals()
                ->first()
                ->getTitle();
            $projectName = $proposalPost
                ->getProposals()
                ->first()
                ->getProject()
                ->getTitle();
            $proposalPostAuthor = $proposalPost
                ->getAuthors()
                ->first()
                ->getDisplayname();

            $this->em->remove($proposalPost);
            $this->publisher->publish(
                'proposal_news.delete',
                new Message(
                    json_encode([
                        'postId' => $id,
                        'proposalName' => $proposalName,
                        'projectName' => $projectName,
                        'postAuthor' => $proposalPostAuthor,
                    ])
                )
            );

            return ['postId' => $id, 'errorCode' => null];
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }
    }

    private function getPost(Arg $input, User $viewer): Post
    {
        $proposalPostGlobalId = $input->offsetGet('postId');
        $proposalPost = $this->globalIdResolver->resolve($proposalPostGlobalId, $viewer);
        if (!$proposalPost || !$proposalPost instanceof Post) {
            $this->logger->error('Unknown post with id: ' . $proposalPostGlobalId);

            throw new UserError(self::POST_NOT_FOUND);
        }
        if (!$proposalPost->isAuthor($viewer) && !$viewer->isAdmin()) {
            throw new UserError(self::ACCESS_DENIED);
        }

        return $proposalPost;
    }
}
