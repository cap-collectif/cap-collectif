<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ResponseResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolveValue(AbstractResponse $response)
    {
        if ($response instanceof ValueResponse && null !== $response->getValue()) {
            return json_decode($response->getValue(), true);
        }

        return null;
    }
}
