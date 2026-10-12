<?php

namespace Capco\Tests\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\GraphQL\DataLoader\Step\StepContributionsDataLoader;
use Capco\AppBundle\Resolver\ContributionResolver;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ProjectContributionCountTest extends KernelTestCase
{
    /** @dataProvider projectVisibility */
    public function testCountsQuestionnaireContributionsWithoutAuthentication(int $visibility, int $expectedCount): void
    {
        self::bootKernel();
        $container = self::getContainer();
        $container->get('security.token_storage')->setToken(null);
        $container->get(StepContributionsDataLoader::class)->disableCache();

        $project = (new Project())->setVisibility($visibility);
        $step = (new QuestionnaireStep())->setQuestionnaire(new Questionnaire());
        // This fixture step has one published, completed, non-draft reply: reply3.
        $step->setId('questionnairestep2');
        $association = (new ProjectAbstractStep())->setStep($step);
        $step->setProjectAbstractStep($association);
        $project->addStep($association);

        $count = $container->get(ContributionResolver::class)->countProjectContributions($project);

        self::assertSame($expectedCount, $count);
    }

    /** @return array<string, array{int, int}> */
    public function projectVisibility(): array
    {
        return [
            'public project' => [ProjectVisibilityMode::VISIBILITY_PUBLIC, 1],
            'private project' => [ProjectVisibilityMode::VISIBILITY_ADMIN, 0],
        ];
    }
}
