<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Symfony\Component\Translation\Translator;
use Twig\Extension\RuntimeExtensionInterface;

class ProjectLabelMetaRuntime implements RuntimeExtensionInterface
{
    private $translator;

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;
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
        $transKey = self::getTransKeyFromLabel($label, $title);

        return $this->translator->trans($transKey, ['count' => $count], 'CapcoAppBundle');
    }

    private static function getTransKeyFromLabel(string $label, string $title): string
    {
        if ('contributors_count' === $label) {
            return 'global.counters.contributors';
        }
        if ('articlesCount' === $label) {
            return 'article-count';
        }
        if ('repliesCount' === $label) {
            return 'answer-count';
        }
        if ('sourcesCount' === $label) {
            return 'source-count';
        }
        if ('total_count' === $label) {
            return 'global.counters.contributions';
        }
        if ('versionsCount' === $label) {
            return 'amendment-count';
        }
        if ('votes_count' === $label && 'project.types.interpellation' === $title) {
            return 'support.count_no_nb';
        }
        if ('votes_count' === $label) {
            return 'vote.count_no_nb';
        }
        if ('supports_count' === $label) {
            return 'support.count_no_nb';
        }

        return '';
    }
}
