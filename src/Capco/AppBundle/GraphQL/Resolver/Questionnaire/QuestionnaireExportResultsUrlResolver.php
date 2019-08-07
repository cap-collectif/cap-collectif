<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Symfony\Component\Routing\RouterInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

/**
 * This handle the logic of export results file generated for admin.
 */
class QuestionnaireExportResultsUrlResolver implements ResolverInterface
{
    private $router;
    private $projectDir;

    public function __construct(string $projectDir, RouterInterface $router)
    {
        $this->projectDir = $projectDir;
        $this->router = $router;
    }

    public function __invoke(Questionnaire $questionnaire): string
    {
        return $this->router->generate(
            'app_questionnaire_download',
            ['questionnaireId' => $questionnaire->getId()],
            RouterInterface::ABSOLUTE_URL
        );
    }

    public function getFileName(Questionnaire $questionnaire): string
    {
        $step = $questionnaire->getStep();
        if (!$step) {
            return '';
        }

        $fileName = '';
        $project = $step->getProject();

        if ($project) {
            $fileName .= $project->getSlug() . '_';
        }
        $fileName .= $step->getSlug() . '.xlsx';

        return $fileName;
    }

    public function getFilePath(Questionnaire $questionnaire): string
    {
        return $this->projectDir . '/web/export/' . $this->getFileName($questionnaire);
    }
}
