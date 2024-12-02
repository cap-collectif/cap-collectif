<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class GlobalIdExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            new TwigFilter('toGlobalId', $this->toGlobalId(...)),
            new TwigFilter('toStepGlobalId', $this->toStepGlobalId(...)),
        ];
    }

    public function toGlobalId(string $id, string $type): string
    {
        return GlobalId::toGlobalId($type, $id);
    }

    public function toStepGlobalId(AbstractStep $step): string
    {
        $type = null;

        switch ($step::class) {
            case CollectStep::class:
                $type = 'CollectStep';

                break;

            case SelectionStep::class:
                $type = 'SelectionStep';

                break;

            case QuestionnaireStep::class:
                $type = 'QuestionnaireStep';

                break;

            case OtherStep::class:
                $type = 'OtherStep';

                break;

            case RankingStep::class:
                $type = 'RankingStep';

                break;

            case ConsultationStep::class:
                $type = 'ConsultationStep';

                break;

            case PresentationStep::class:
                $type = 'PresentationStep';

                break;

            case DebateStep::class:
                $type = 'DebateStep';

                break;
        }

        if (!$type) {
            throw new \RuntimeException(__METHOD__ . 'Could not guess type for step ' . $step->getId());
        }

        return GlobalId::toGlobalId($type, $step->getId());
    }
}
