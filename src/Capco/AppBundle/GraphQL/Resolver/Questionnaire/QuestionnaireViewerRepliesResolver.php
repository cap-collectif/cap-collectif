<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionnaireViewerRepliesResolver implements ResolverInterface
{
    protected $replyRepo;

    public function __construct(ReplyRepository $replyRepo)
    {
        $this->replyRepo = $replyRepo;
    }

    public function __invoke(Questionnaire $questionnaire, User $user): Collection
    {
        return $this->replyRepo->getForUserAndQuestionnaire($questionnaire, $user);
    }
}
