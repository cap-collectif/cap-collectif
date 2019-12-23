<?php

namespace spec\Capco\AppBundle\Utils;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Utils\Diff;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;

class DiffSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(Diff::class);
    }

    public function it_should_return_an_empty_array_when_no_difference_with_simple_array_collections(): void
    {
        $a = new ArrayCollection([
            [
                'id' => 1,
                'title' => 'le beau titre 1'
            ],
            [
                'id' => 2,
                'title' => 'le beau titre 2'
            ]
        ]);

        $b = new ArrayCollection([
            [
                'id' => 1,
                'title' => 'le beau titre 1'
            ],
            [
                'id' => 2,
                'title' => 'le beau titre 2'
            ]
        ]);

        $this::fromCollectionsWithId($a, $b)
            ->toArray()
            ->shouldReturn([]);
    }

    public function it_should_return_an_array_when_differences_with_simple_array_collections(): void
    {
        $a = new ArrayCollection([
            [
                'id' => 1,
                'title' => 'le beau titre 1'
            ],
            [
                'id' => 2,
                'title' => 'le beau titre 2'
            ]
        ]);

        $b = new ArrayCollection([
            [
                'id' => 2,
                'title' => 'le beau titre 2'
            ]
        ]);

        $this::fromCollectionsWithId($a, $b)
            ->toArray()
            ->shouldReturn([
                [
                    'id' => 1,
                    'title' => 'le beau titre 1'
                ]
            ]);
    }

    public function it_should_return_an_empty_array_when_no_differences_with_complex_array_collections(): void
    {
        $a = new ArrayCollection([
            [
                'id' => 1,
                'title' => 'le beau titre 1'
            ],
            [
                'id' => 2,
                'title' => 'le beau titre 2'
            ],
            [
                'id' => 3,
                'title' => 'Hélas je vais être supprimé'
            ],
            [
                'id' => 4,
                'title' => 'Pareil que mon voisin du dessus :('
            ],
            [
                'id' => 5,
                'title' => 'le beau titre 5'
            ],
            [
                'id' => 6,
                'title' => 'Oopsie moi aussi je vais dire adieu'
            ],
            [
                'id' => 7,
                'title' => 'https://www.youtube.com/watch?v=pjJ2w1FX_Wg'
            ]
        ]);

        $b = new ArrayCollection([
            [
                'id' => 1,
                'title' => 'le beau titre 1'
            ],
            [
                'id' => 2,
                'title' => 'le beau titre 2'
            ],
            [
                'id' => 3,
                'title' => 'Hélas je vais être supprimé'
            ],
            [
                'id' => 4,
                'title' => 'Pareil que mon voisin du dessus :('
            ],
            [
                'id' => 5,
                'title' => 'le beau titre 5'
            ],
            [
                'id' => 6,
                'title' => 'Oopsie moi aussi je vais dire adieu'
            ],
            [
                'id' => 7,
                'title' => 'https://www.youtube.com/watch?v=pjJ2w1FX_Wg'
            ]
        ]);

        $this::fromCollectionsWithId($a, $b)
            ->toArray()
            ->shouldReturn([]);
    }

    public function it_should_return_an_array_when_differences_with_complex_array_collections(): void
    {
        $a = new ArrayCollection([
            [
                'id' => 1,
                'title' => 'le beau titre 1'
            ],
            [
                'id' => 2,
                'title' => 'le beau titre 2'
            ],
            [
                'id' => 3,
                'title' => 'Hélas je vais être supprimé'
            ],
            [
                'id' => 4,
                'title' => 'Pareil que mon voisin du dessus :('
            ],
            [
                'id' => 5,
                'title' => 'le beau titre 5'
            ],
            [
                'id' => 6,
                'title' => 'Oopsie moi aussi je vais dire adieu'
            ],
            [
                'id' => 7,
                'title' => 'https://www.youtube.com/watch?v=pjJ2w1FX_Wg'
            ]
        ]);

        $b = new ArrayCollection([
            [
                'id' => 1,
                'title' => 'le beau titre 1'
            ],
            [
                'id' => 2,
                'title' => 'le beau titre 2'
            ],
            [
                'id' => 5,
                'title' => 'le beau titre 5'
            ],
            [
                'id' => 7,
                'title' => 'https://www.youtube.com/watch?v=pjJ2w1FX_Wg'
            ]
        ]);

        $subject = $this::fromCollectionsWithId($a, $b)->toArray();
        $subject->shouldReturn([
            [
                'id' => 3,
                'title' => 'Hélas je vais être supprimé'
            ],
            [
                'id' => 4,
                'title' => 'Pareil que mon voisin du dessus :('
            ],
            [
                'id' => 6,
                'title' => 'Oopsie moi aussi je vais dire adieu'
            ]
        ]);
    }

    public function it_should_return_an_empty_array_when_no_difference_with_simple_entity_collections(
        AbstractStep $stepAFirst,
        AbstractStep $stepASecond,
        AbstractStep $stepBFirst,
        AbstractStep $stepBSecond
    ): void {
        $stepAFirst->getId()->willReturn('step1');
        $stepAFirst->getTitle()->willReturn('le beau titre 1');
        $stepASecond->getId()->willReturn('step2');
        $stepASecond->getTitle()->willReturn('le beau titre 2');

        $stepBFirst->getId()->willReturn('step1');
        $stepBFirst->getTitle()->willReturn('le beau titre 1');
        $stepBSecond->getId()->willReturn('step2');
        $stepBSecond->getTitle()->willReturn('le beau titre 2');

        $a = new ArrayCollection([
            $stepAFirst->getWrappedObject(),
            $stepASecond->getWrappedObject()
        ]);

        $b = new ArrayCollection([
            $stepBFirst->getWrappedObject(),
            $stepBSecond->getWrappedObject()
        ]);

        $this::fromCollectionsWithId($a, $b)
            ->toArray()
            ->shouldReturn([]);
    }

    public function it_should_return_an_array_when_differences_with_simple_entity_collections(
        AbstractStep $stepAFirst,
        AbstractStep $stepASecond,
        AbstractStep $stepBFirst,
        AbstractStep $stepBSecond
    ): void {
        $stepAFirst->getId()->willReturn('step1');
        $stepAFirst->getTitle()->willReturn('le beau titre 1');
        $stepASecond->getId()->willReturn('step2');
        $stepASecond->getTitle()->willReturn('le beau titre 2');

        $stepBSecond->getId()->willReturn('step2');
        $stepBSecond->getTitle()->willReturn('le beau titre 2');

        $a = new ArrayCollection([
            $stepAFirst->getWrappedObject(),
            $stepASecond->getWrappedObject()
        ]);

        $b = new ArrayCollection([
            $stepBFirst->getWrappedObject(),
            $stepBSecond->getWrappedObject()
        ]);

        $this::fromCollectionsWithId($a, $b)
            ->toArray()
            ->shouldReturn([$stepAFirst->getWrappedObject()]);
    }

    public function it_should_return_an_empty_array_when_no_differences_with_complex_entity_collections(
        AbstractStep $stepAFirst,
        AbstractStep $stepASecond,
        AbstractStep $stepAThird,
        AbstractStep $stepAFourth,
        AbstractStep $stepAFifth,
        AbstractStep $stepBFirst,
        AbstractStep $stepBSecond,
        AbstractStep $stepBThird,
        AbstractStep $stepBFourth,
        AbstractStep $stepBFifth
    ): void {
        $stepAFirst->getId()->willReturn('step1');
        $stepAFirst->getTitle()->willReturn('le beau titre 1');
        $stepASecond->getId()->willReturn('step2');
        $stepASecond->getTitle()->willReturn('le beau titre 2');
        $stepAThird->getId()->willReturn('step3');
        $stepAThird->getTitle()->willReturn('le beau titre 3');
        $stepAFourth->getId()->willReturn('step4');
        $stepAFourth->getTitle()->willReturn('le beau titre 4');
        $stepAFifth->getId()->willReturn('step5');
        $stepAFifth->getTitle()->willReturn('le beau titre 5');

        $stepBFirst->getId()->willReturn('step1');
        $stepBFirst->getTitle()->willReturn('le beau titre 1');
        $stepBSecond->getId()->willReturn('step2');
        $stepBSecond->getTitle()->willReturn('le beau titre 2');
        $stepBThird->getId()->willReturn('step3');
        $stepBThird->getTitle()->willReturn('le beau titre 3');
        $stepBFourth->getId()->willReturn('step4');
        $stepBFourth->getTitle()->willReturn('le beau titre 4');
        $stepBFifth->getId()->willReturn('step5');
        $stepBFifth->getTitle()->willReturn('le beau titre 5');

        $a = new ArrayCollection([
            $stepAFirst->getWrappedObject(),
            $stepASecond->getWrappedObject(),
            $stepAThird->getWrappedObject(),
            $stepAFourth->getWrappedObject(),
            $stepAFifth->getWrappedObject()
        ]);

        $b = new ArrayCollection([
            $stepBFirst->getWrappedObject(),
            $stepBSecond->getWrappedObject(),
            $stepBThird->getWrappedObject(),
            $stepBFourth->getWrappedObject(),
            $stepBFifth->getWrappedObject()
        ]);

        $this::fromCollectionsWithId($a, $b)
            ->toArray()
            ->shouldReturn([]);
    }

    public function it_should_return_an_array_when_differences_with_complex_entity_collections(
        AbstractStep $stepAFirst,
        AbstractStep $stepASecond,
        AbstractStep $stepAThird,
        AbstractStep $stepAFourth,
        AbstractStep $stepAFifth,
        AbstractStep $stepBFirst,
        AbstractStep $stepBThird,
        AbstractStep $stepBFifth
    ): void {
        $stepAFirst->getId()->willReturn('step1');
        $stepAFirst->getTitle()->willReturn('le beau titre 1');
        $stepASecond->getId()->willReturn('step2');
        $stepASecond->getTitle()->willReturn('le beau titre 2');
        $stepAThird->getId()->willReturn('step3');
        $stepAThird->getTitle()->willReturn('le beau titre 3');
        $stepAFourth->getId()->willReturn('step4');
        $stepAFourth->getTitle()->willReturn('le beau titre 4');
        $stepAFifth->getId()->willReturn('step5');
        $stepAFifth->getTitle()->willReturn('le beau titre 5');

        $stepBFirst->getId()->willReturn('step1');
        $stepBFirst->getTitle()->willReturn('le beau titre 1');
        $stepBThird->getId()->willReturn('step3');
        $stepBThird->getTitle()->willReturn('le beau titre 3');
        $stepBFifth->getId()->willReturn('step5');
        $stepBFifth->getTitle()->willReturn('le beau titre 5');

        $a = new ArrayCollection([
            $stepAFirst->getWrappedObject(),
            $stepASecond->getWrappedObject(),
            $stepAThird->getWrappedObject(),
            $stepAFourth->getWrappedObject(),
            $stepAFifth->getWrappedObject()
        ]);

        $b = new ArrayCollection([
            $stepBFirst->getWrappedObject(),
            $stepBThird->getWrappedObject(),
            $stepBFifth->getWrappedObject()
        ]);

        $this::fromCollectionsWithId($a, $b)
            ->toArray()
            ->shouldReturn([$stepASecond->getWrappedObject(), $stepAFourth->getWrappedObject()]);
    }
}
