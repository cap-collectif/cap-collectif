<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class ViewerFollowingConfigurationOpinionVersionResolver implements ResolverInterface
{
    private $followerRepository;
    private $logger;

    public function __construct(FollowerRepository $followerRepository, LoggerInterface $logger)
    {
        $this->followerRepository = $followerRepository;
        $this->logger = $logger;
    }

    public function __invoke(OpinionVersion $opinion, User $viewer): ?string
    {
        try {
            $follower = $this->followerRepository->findOneBy([
                'opinionVersion' => $opinion,
                'user' => $viewer
            ]);

            if ($follower) {
                return $follower->getNotifiedOf();
            }

            return null;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Find following opinion version by user failed');
        }
    }
}
