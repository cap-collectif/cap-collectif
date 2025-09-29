<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Command\ExportQuestionnaireContributionsCommand;
use Capco\AppBundle\Entity\Questionnaire;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\RouterInterface;

/**
 * This handle the logic of export results file generated for admin.
 */
class QuestionnaireExportResultsUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly string $projectDir,
        private readonly RouterInterface $router
    ) {
    }

    public function __invoke(Questionnaire $questionnaire): string
    {
        return $this->router->generate(
            'app_questionnaire_download',
            ['questionnaireId' => $questionnaire->getId()],
            RouterInterface::ABSOLUTE_URL
        );
    }

    public function getFileName(Questionnaire $questionnaire, bool $projectAdmin = false): string
    {
        return ExportQuestionnaireContributionsCommand::getFileName($questionnaire, $projectAdmin);
    }

    public function getFilePath(Questionnaire $questionnaire, bool $projectAdmin = false): string
    {
        return $this->projectDir .
            '/public/export/questionnaire' .
            $this->getFileName($questionnaire, $projectAdmin);
    }
}
