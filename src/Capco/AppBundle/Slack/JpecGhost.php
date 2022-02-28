<?php

namespace Capco\AppBundle\Slack;

use Capco\AppBundle\Entity\AnalysisConfigurationProcess;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectAdminAlphaUrlResolver;

class JpecGhost extends AbstractSlackMessager
{
    private ProjectAdminAlphaUrlResolver $projectAdminAlphaUrlResolver;
    private ?string $hook;
    private string $env;

    public function __construct(
        ProjectAdminAlphaUrlResolver $projectAdminAlphaUrlResolver,
        ?string $hook,
        string $env
    ) {
        $this->projectAdminAlphaUrlResolver = $projectAdminAlphaUrlResolver;
        $this->hook = $hook;
        $this->env = $env;
    }

    public function generateAndSendMessage(AnalysisConfigurationProcess $process)
    {
        if ('test' !== $this->env && $this->hook) {
            return $this->send($this->generateSlackMessage($process));
        }
    }

    protected function getHook(): string
    {
        return 'https://hooks.slack.com/services/' . $this->hook;
    }

    private function generateSlackMessage(AnalysisConfigurationProcess $process): string
    {
        return $this->prefixIfNotProd() .
            " l'analyse de l'étape du projet " .
            $this->getProjectUrlAndName($process) .
            ' vient de passer avec ' .
            $process->getDecisions()->count() .
            ' décisions appliquées';
    }

    private function getProjectUrlAndName(AnalysisConfigurationProcess $process): string
    {
        $step = $process->getAnalysisConfiguration()->getAnalysisStep();

        return '[<' .
            $this->projectAdminAlphaUrlResolver->__invoke($step->getProject()) .
            '|' .
            $step->getProject()->getTitle() .
            '>]';
    }

    private function prefixIfNotProd(): string
    {
        return 'prod' === $this->env ? '' : $this->env;
    }
}
