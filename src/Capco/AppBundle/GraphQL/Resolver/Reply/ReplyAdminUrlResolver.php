<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\AbstractReply;
use Capco\AppBundle\Entity\Reply;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ReplyAdminUrlResolver implements ResolverInterface
{
    private RouterInterface $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(AbstractReply $reply): ?string
    {
        if ($reply instanceof Reply) {
            return $this->router->generate(
                'admin_capco_app_reply_show',
                [
                    'id' => $reply->getId(),
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }

        return null;
    }
}
