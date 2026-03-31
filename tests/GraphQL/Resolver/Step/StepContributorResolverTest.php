<?php

namespace Capco\Tests\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\Step\StepContributorResolver;
use Capco\AppBundle\Repository\SelectionStepRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class StepContributorResolverTest extends KernelTestCase
{
    private StepContributorResolver $resolver;
    private SelectionStepRepository $selectionStepRepository;

    protected function setUp(): void
    {
        self::bootKernel();

        $container = static::getContainer();

        $resolver = $container->get(StepContributorResolver::class);
        \assert($resolver instanceof StepContributorResolver);
        $this->resolver = $resolver;

        $selectionStepRepository = $container->get(SelectionStepRepository::class);
        \assert($selectionStepRepository instanceof SelectionStepRepository);
        $this->selectionStepRepository = $selectionStepRepository;
    }

    public function testItPaginatesSelectionStepContributorsAcrossUserAndParticipantPageBoundaries(): void
    {
        /**
         * @var null|SelectionStep $selectionStep
         *                         This selectionstep1 in fixtures has 47 users followed by 2 participants
         */
        $selectionStep = $this->selectionStepRepository->find('selectionstep1');

        $this->assertInstanceOf(SelectionStep::class, $selectionStep);

        $firstPage = ($this->resolver)(
            $selectionStep,
            new Argument(['first' => 30])
        );

        $this->assertCount(30, $firstPage->getEdges());
        $this->assertSame(49, $firstPage->getTotalCount());
        $this->assertTrue($firstPage->getPageInfo()->getHasNextPage());
        $this->assertInstanceOf(User::class, $firstPage->getEdges()[29]->getNode());

        $secondPage = ($this->resolver)(
            $selectionStep,
            new Argument([
                'first' => 18,
                'after' => $firstPage->getPageInfo()->getEndCursor(),
            ])
        );

        $this->assertCount(18, $secondPage->getEdges());
        $this->assertSame(49, $secondPage->getTotalCount());
        $this->assertTrue($secondPage->getPageInfo()->getHasNextPage());

        $this->assertInstanceOf(User::class, $secondPage->getEdges()[0]->getNode());
        $this->assertInstanceOf(User::class, $secondPage->getEdges()[16]->getNode());
        $this->assertInstanceOf(Participant::class, $secondPage->getEdges()[17]->getNode());

        $thirdPage = ($this->resolver)(
            $selectionStep,
            new Argument([
                'first' => 1,
                'after' => $secondPage->getPageInfo()->getEndCursor(),
            ])
        );

        $this->assertCount(1, $thirdPage->getEdges());
        $this->assertSame(49, $thirdPage->getTotalCount());
        $this->assertInstanceOf(Participant::class, $thirdPage->getEdges()[0]->getNode());
    }
}
