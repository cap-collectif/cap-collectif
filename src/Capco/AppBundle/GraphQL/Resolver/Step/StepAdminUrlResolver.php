<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Routing\RouterInterface;
use Doctrine\Common\Util\ClassUtils;

class StepAdminUrlResolver implements ResolverInterface
{
    private RouterInterface $router;
    private const ADMIN_NEXT_STEP_TYPE = [
            OtherStep::class => 'other-step',
            QuestionnaireStep::class => 'questionnaire-step',
            ConsultationStep::class => 'consultation-step',
            CollectStep::class => 'collect-step',
            SelectionStep::class => 'selection-step',
            DebateStep::class => 'debate-step',
            RankingStep::class => 'ranking-step',
        ];

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(AbstractStep $step): string
    {
        $className = ClassUtils::getClass($step);
        $stepType = self::ADMIN_NEXT_STEP_TYPE[$className];

        $baseUrl = $this->router->getContext()->getBaseUrl();
        $project = $step->getProject();
        $projectId = GlobalId::toGlobalId('Project', $project->getId());

        $splittedClassName = explode("\\", $className);
        $classNameWithoutNameSpace = end($splittedClassName);
        $stepId = GlobalId::toGlobalId($classNameWithoutNameSpace, $step->getId());

        $url = "{$baseUrl}/admin-next/project/{$projectId}/update-step/{$stepType}/{$stepId}";
        return $url;
    }
}
