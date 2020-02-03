<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Symfony\Component\Translation\Translator;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ProjectLabelMetaExtension extends AbstractExtension
{
    private $translator;

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('project_type_meta_label', [$this, 'getProjectTypeMetaLabel'])];
    }

    public function getProjectTypeMetaLabel(
        AbstractStep $currentStep,
        string $label,
        int $count
    ): string {
        $projectType = $currentStep->getProject()
            ? $currentStep->getProject()->getProjectType()
            : false;
        $title = $projectType ? $projectType->getTitle() : false;
        if ('votes_count' === $label && $title) {
            if ('project.types.interpellation' === $title) {
                return $this->createTransChoice('project.show.meta.supports_count', $count);
            }

            return $this->createTransChoice('project.show.meta.votes_count', $count);
        }

        return $this->createTransChoice('project.show.meta.' . $label, $count);
    }

    private function createTransChoice(string $id, int $count): string
    {
        return $this->translator->transChoice($id, $count, ['%count%' => $count], 'CapcoAppBundle');
    }
}
