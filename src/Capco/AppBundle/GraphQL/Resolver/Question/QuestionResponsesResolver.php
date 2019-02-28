<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Repository\MediaResponseRepository;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class QuestionResponsesResolver implements ResolverInterface
{
    private $mediaResponseRepository;
    private $valueResponseRepository;
    private $logger;

    public function __construct(
        ValueResponseRepository $valueResponseRepository,
        MediaResponseRepository $mediaResponseRepository,
        LoggerInterface $logger
    ) {
        $this->mediaResponseRepository = $mediaResponseRepository;
        $this->valueResponseRepository = $valueResponseRepository;
        $this->logger = $logger;
    }

    public function __invoke(AbstractQuestion $question, Arg $args): Connection
    {
        $totalCount = 0;
        if ($question instanceof MultipleChoiceQuestion || $question instanceof SimpleQuestion) {
            $totalCount = $this->valueResponseRepository->countByQuestion($question);
        }
        if ($question instanceof MediaQuestion) {
            $totalCount = $this->mediaResponseRepository->countByQuestion($question);
        }

        // get data of $question instanceof MultipleChoiceQuestion && $question instanceof SimpleQuestion && $question instanceof MediaQuestion
        $paginator = new Paginator(function ($offset, $limit) use ($question) {
            try {
                if (
                    $question instanceof MultipleChoiceQuestion ||
                    $question instanceof SimpleQuestion
                ) {
                    $responses = $this->valueResponseRepository->getAllByQuestion(
                        $question,
                        $limit,
                        $offset
                    );
                } else {
                    $responses = $this->mediaResponseRepository->getAllByQuestion(
                        $question,
                        $limit,
                        $offset
                    );
                }

                return $responses->getIterator()->getArrayCopy();
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find responses of survey failed');
            }
        });

        return $paginator->auto($args, $totalCount);
    }
}
