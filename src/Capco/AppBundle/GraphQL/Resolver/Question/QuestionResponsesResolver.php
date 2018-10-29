<?php
namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionResponsesResolver implements ResolverInterface
{
    private $responseRepository;
    private $valueResponseRepository;

    public function __construct(
        ValueResponseRepository $valueResponseRepository,
        AbstractResponseRepository $responseRepository
    ) {
        $this->responseRepository = $responseRepository;
        $this->valueResponseRepository = $valueResponseRepository;
    }

    public function __invoke(AbstractQuestion $question, Arg $args): Connection
    {
        $totalCount = 0;
        if ($question instanceof MultipleChoiceQuestion || $question instanceof SimpleQuestion) {
            $totalCount = $this->valueResponseRepository->countByQuestion($question);
        } else {
            $totalCount = $this->responseRepository->countByQuestion($question);
        }

        $paginator = new Paginator(function () {
            return [];
        });

        return $paginator->auto($args, $totalCount);
    }
}
