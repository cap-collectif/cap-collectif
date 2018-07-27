<?php
namespace Capco\AppBundle\GraphQL\Resolver\QuestionChoice;

use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QuestionChoiceResponseResolver implements ResolverInterface
{
    private $responseRepository;

    public function __construct(AbstractResponseRepository $responseRepository)
    {
        $this->responseRepository = $responseRepository;
    }

    public function __invoke(QuestionChoice $questionChoice, Arg $args): Connection
    {
        $responses = $this->responseRepository->findBy([
            'question' => $questionChoice->getQuestion(),
        ]);
        $totalCount = 0;

        foreach ($responses as $response) {
            $responseValue = $response ? $response->getValue() : null;
            if ($responseValue && isset($responseValue['labels'])) {
                foreach ($responseValue['labels'] as $label) {
                    if ($label === $questionChoice->getTitle()) {
                        ++$totalCount;
                    }
                }
            }
        }

        $paginator = new Paginator(function () {
            return [];
        });

        return $paginator->auto($args, $totalCount);
    }
}
