<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ReplyRepository;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionnaireViewerRepliesResolver implements ResolverInterface
{
    use ResolverTrait;

    protected $replyRepo;

    public function __construct(ReplyRepository $replyRepo)
    {
        $this->replyRepo = $replyRepo;
    }

    public function __invoke(Questionnaire $questionnaire, $viewer): Collection
    {
        $viewer = $this->preventNullableViewer($viewer);

        return $this->replyRepo->getForUserAndQuestionnaire($questionnaire, $viewer);
    }
}
