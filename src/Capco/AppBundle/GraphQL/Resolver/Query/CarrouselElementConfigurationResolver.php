<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Section\Section;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class CarrouselElementConfigurationResolver implements QueryInterface
{
    public function __construct(private readonly LoggerInterface $logger)
    {
    }

    /**
     * @return ConnectionInterface|Promise
     */
    public function __invoke(Section $section)
    {
        $totalCount = $section->getSectionCarrouselElements()->count();

        $args = new Argument([
            'first' => $totalCount,
        ]);

        $paginator = new Paginator(function () use ($section) {
            try {
                $arguments = $section
                    ->getSectionCarrouselElements()
                    ->toArray()
                ;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \Error('Error during fetching carrousel elements of section' . $section->getTitle());
            }

            return $arguments;
        });

        return $paginator->auto($args, $totalCount);
    }
}
