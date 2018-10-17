<?php
namespace Capco\AppBundle\GraphQL\Resolver\QuestionChoice;

use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class OtherQuestionChoiceResponseResolver implements ResolverInterface
{
    private $responseRepository;

    public function __construct(AbstractResponseRepository $responseRepository)
    {
        $this->responseRepository = $responseRepository;
    }

    public function __invoke(MultipleChoiceQuestion $question, Arg $args): Connection
    {
        $responses = $this->responseRepository->findBy([
            'question' => $question,
        ]);
        $totalCount = 0;

        // Responses values are in an array so we can't directly request them. Maybe SQL request with JSON conditions ?
        foreach ($responses as $response) {
            $responseValue = $response ? $response->getValue() : null;
            if ($responseValue) {
                if (isset($responseValue['other']) && $responseValue['other'] !== null) {
                    ++$totalCount;
                }
            }
        }

        $paginator = new Paginator(function () use ($responses) {
            return $responses;
        });

        return $paginator->auto($args, $totalCount);
    }
}
