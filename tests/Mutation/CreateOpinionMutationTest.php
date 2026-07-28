<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Form\OpinionForm;
use Capco\AppBundle\GraphQL\Mutation\CreateOpinionMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\TestCase;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

/**
 * @internal
 * @coversNothing
 */
class CreateOpinionMutationTest extends TestCase
{
    public function testCreateOpinionPublishesCreationMessage(): void
    {
        $projectId = 'project1';
        $opinionTypeId = 'opinionType1';
        $stepId = 'consultationStep1';
        $opinionId = 'opinion1';

        $project = $this->createMock(Project::class);
        $project->method('isOpinionCanBeFollowed')->willReturn(false);

        $opinionType = $this->createMock(OpinionType::class);
        $opinionType->method('getIsEnabled')->willReturn(true);
        $opinionType->method('getConsultation')->willReturn($this->createMock(Consultation::class));

        $step = $this->createMock(ConsultationStep::class);
        $step->method('canContribute')->willReturn(true);

        $viewer = $this->createMock(User::class);
        $form = $this->createMock(FormInterface::class);
        $form->method('submit')->willReturnSelf();
        $form->method('isValid')->willReturn(true);

        $formFactory = $this->createMock(FormFactoryInterface::class);
        $formFactory
            ->expects($this->once())
            ->method('create')
            ->with(OpinionForm::class, $this->isInstanceOf(Opinion::class))
            ->willReturn($form)
        ;

        $em = $this->createMock(EntityManagerInterface::class);
        $em
            ->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Opinion $opinion) use ($opinionId): bool {
                $opinion->setId($opinionId);

                return true;
            }))
        ;
        $em->expects($this->once())->method('flush');

        $publisher = $this->createMock(Publisher::class);
        $publisher
            ->expects($this->once())
            ->method('publish')
            ->with(
                CapcoAppBundleMessagesTypes::OPINION_CREATE,
                $this->callback(
                    fn (Message $message): bool => $message->getBody() === json_encode(['opinionId' => $opinionId])
                )
            )
        ;

        $projectRepository = $this->createMock(ProjectRepository::class);
        $projectRepository->method('find')->with($projectId)->willReturn($project);

        $opinionTypeRepository = $this->createMock(OpinionTypeRepository::class);
        $opinionTypeRepository->method('find')->with($opinionTypeId)->willReturn($opinionType);

        $globalIdResolver = $this->createMock(GlobalIdResolver::class);
        $globalIdResolver->method('resolve')->with($stepId, $viewer)->willReturn($step);

        $stepRequirementsResolver = $this->createMock(StepRequirementsResolver::class);
        $stepRequirementsResolver
            ->method('viewerMeetsTheRequirementsResolver')
            ->with($viewer, $step)
            ->willReturn(true)
        ;

        $opinionRepository = $this->createMock(OpinionRepository::class);
        $opinionRepository->method('findCreatedSinceIntervalByAuthor')->with($viewer, 'PT1M')->willReturn([]);

        $mutation = new CreateOpinionMutation(
            $formFactory,
            $em,
            $projectRepository,
            $opinionTypeRepository,
            $this->createMock(ConsultationStepRepository::class),
            $stepRequirementsResolver,
            $opinionRepository,
            $publisher,
            $globalIdResolver
        );

        $mutation(new Argument(['input' => [
            'projectId' => $projectId,
            'opinionTypeId' => $opinionTypeId,
            'stepId' => $stepId,
            'title' => 'An opinion',
            'body' => 'Opinion body',
        ]]), $viewer);
    }
}
