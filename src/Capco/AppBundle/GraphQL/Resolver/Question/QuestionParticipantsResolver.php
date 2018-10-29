<?php
namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Repository\MediaResponseRepository;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionParticipantsResolver implements ResolverInterface
{
    private $valueResponseRepository;
    private $mediaResponseRepository;

    public function __construct(
        ValueResponseRepository $valueResponseRepository,
        MediaResponseRepository $mediaResponseRepository
    ) {
        $this->valueResponseRepository = $valueResponseRepository;
        $this->mediaResponseRepository = $mediaResponseRepository;
    }

    public function __invoke(AbstractQuestion $question, Arg $args): Connection
    {
        $totalCount = 0;

        if ($question instanceof MultipleChoiceQuestion || $question instanceof SimpleQuestion) {
            $totalCount = $this->valueResponseRepository->countParticipantsByQuestion($question);
        }

        if ($question instanceof MediaQuestion) {
            $totalCount = $this->mediaResponseRepository->countParticipantsByQuestion($question);
        }

        $paginator = new Paginator(function () {
            return [];
        });

        return $paginator->auto($args, $totalCount);
    }
}
