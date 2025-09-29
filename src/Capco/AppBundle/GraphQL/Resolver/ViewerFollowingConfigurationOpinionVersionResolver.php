<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class ViewerFollowingConfigurationOpinionVersionResolver implements QueryInterface
{
    public function __construct(
        private readonly FollowerRepository $followerRepository,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(OpinionVersion $opinion, User $viewer): ?string
    {
        try {
            $follower = $this->followerRepository->findOneBy([
                'opinionVersion' => $opinion,
                'user' => $viewer,
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
