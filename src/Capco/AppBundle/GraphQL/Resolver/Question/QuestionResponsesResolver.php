<?php
namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QuestionResponsesResolver implements ResolverInterface
{
    private $responseRepository;

    public function __construct(AbstractResponseRepository $responseRepository)
    {
        $this->responseRepository = $responseRepository;
    }

    public function __invoke(AbstractQuestion $question, Arg $args): Connection
    {
        $totalCount = $this->responseRepository->countByQuestion($question);
        $paginator = new Paginator(function () {
            return [];
        });

        return $paginator->auto($args, $totalCount);
    }
}
