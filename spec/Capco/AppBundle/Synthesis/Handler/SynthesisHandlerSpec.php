<?php

namespace spec\Capco\AppBundle\Synthesis\Handler;

use Capco\AppBundle\Synthesis\Extractor\ConsultationStepExtractor;
use PhpSpec\ObjectBehavior;
use Doctrine\ORM\EntityManager;

class SynthesisHandlerSpec extends ObjectBehavior
{
    function let(EntityManager $em, ConsultationStepExtractor $csExtractor)
    {
        $this->beConstructedWith($em, $csExtractor);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Synthesis\Handler\SynthesisHandler');
    }

    /*function it_can_get_all_syntheses(EntityManager $em, EntityRepository $repo, ArrayCollection $collection)
    {
        $em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->willReturn($repo)->shouldBeCalled();
        $repo->findAll()->willReturn($collection)->shouldBeCalled();

        $this->beConstructedWith($em);
        $this->getAll()->shouldReturnAnInstanceOf('Doctrine\Common\Collections\ArrayCollection');
    }

    function it_can_create_synthesis(EntityManager $em, Synthesis $synthesis)
    {
        $em->persist($synthesis)->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->beConstructedWith($em);
        $this->createSynthesis($synthesis)->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\Synthesis\Synthesis');
    }

    function it_can_create_elements_from_source(EntityManager $em, Synthesis $synthesis, ConsultationStep $consultationStep)
    {
        // Case where source is a consultation step
        $synthesis->getSourceType()->willReturn('consultation_step')->shouldBeCalled();
        $synthesis->getConsultationStep()->willReturn($consultationStep)->shouldBeCalled();

        $this->beConstructedWith($em);
        $this->createElementsFromSource($synthesis)->shouldReturn(true);

        // Case where source is not a consultation step
        $synthesis->getSourceType()->willReturn('none')->shouldBeCalled();
        $synthesis->getConsultationStep()->willReturn(null)->shouldBeCalled();

        $this->beConstructedWith($em);
        $this->createElementsFromSource($synthesis)->shouldReturn(false);
    }

    function it_can_create_elements_from_consultation_step(EntityManager $em, Synthesis $synthesis, ConsultationStep $consultationStep, SynthesisElement $element1, SynthesisElement $element2, SynthesisElement $element3, Opinion $opinion1, Opinion $opinion2, Argument $argument1, Argument $argument2, Argument $argument3, Argument $argument4, SynthesisElement $elementFromOpinion2, SynthesisElement $elementFromArgument1, SynthesisElement $elementFromArgument3)
    {
        $currentElements = new ArrayCollection([$element1, $element2, $element3]);

        $opinions = new ArrayCollection([$opinion1, $opinion2]);

        $opinion1Arguments = new ArrayCollection([$argument1, $argument2]);
        $opinion2Arguments = new ArrayCollection([$argument3, $argument4]);

        $synthesis->getElements()->willReturn($currentElements)->shouldBeCalled();
        $consultationStep->getOpinions()->willReturn($opinions)->shouldBeCalled();

        // Opinion 1 (already linked to element1)
        $this->isElementRelated($element1, $opinion1)->willReturn(true)->shouldBeCalled();
        $this->isElementRelated($element2, $opinion1)->shouldNotBeCalled();
        $this->isElementRelated($element3, $opinion1)->shouldNotBeCalled();
        $this->createElementFromOpinion($opinion1)->shouldNotBeCalled();

        $opinion1->getArguments()->willReturn($opinion1Arguments)->shouldBeCalled();

        // Argument 1 (not linked)
        $this->isElementRelated($element1, $argument1)->willReturn(false)->shouldBeCalled();
        $this->isElementRelated($element2, $argument1)->willReturn(false)->shouldBeCalled();
        $this->isElementRelated($element3, $argument1)->willReturn(false)->shouldBeCalled();
        $this->createElementFromArgument($argument1)->willReturn($elementFromArgument1)->shouldBeCalled();
        $elementFromArgument1->setParent($element1)->shouldBeCalled();

        // Argument 2 (already linked to element2)
        $this->isElementRelated($element1, $argument1)->willReturn(false)->shouldBeCalled();
        $this->isElementRelated($element2, $argument1)->willReturn(true)->shouldBeCalled();
        $this->isElementRelated($element3, $argument1)->shouldNotBeCalled();
        $this->createElementFromArgument($argument2)->shouldNotBeCalled();

        // Opinion 2 (not linked)
        $this->isElementRelated($element1, $opinion2)->willReturn(false)->shouldBeCalled();
        $this->isElementRelated($element2, $opinion2)->willReturn(false)->shouldBeCalled();
        $this->isElementRelated($element3, $opinion2)->willReturn(false)->shouldBeCalled();
        $this->createElementFromOpinion($opinion2)->willReturn($elementFromOpinion2)->shouldBeCalled();

        $opinion2->getArguments()->willReturn($opinion2Arguments)->shouldBeCalled();

        // Argument 3 (not linked)
        $this->isElementRelated($element1, $argument3)->willReturn(false)->shouldBeCalled();
        $this->isElementRelated($element2, $argument3)->willReturn(false)->shouldBeCalled();
        $this->isElementRelated($element3, $argument3)->willReturn(false)->shouldBeCalled();
        $this->createElementFromArgument($argument3)->willReturn($elementFromArgument3)->shouldBeCalled();
        $elementFromArgument3->setParent($elementFromOpinion2)->shouldBeCalled();

        // Argument 4 (already linked to element3)
        $this->isElementRelated($element1, $argument4)->willReturn(false)->shouldBeCalled();
        $this->isElementRelated($element2, $argument4)->willReturn(false)->shouldBeCalled();
        $this->isElementRelated($element3, $argument4)->willReturn(true)->shouldBeCalled();
        $this->createElementFromArgument($argument4)->shouldNotBeCalled();

        $elementFromOpinion2->setSynthesis($synthesis)->shouldBeCalled();
        $em->persist($elementFromOpinion2)->shouldBeCalled();
        $elementFromArgument1->setSynthesis($synthesis)->shouldBeCalled();
        $em->persist($elementFromArgument1)->shouldBeCalled();
        $elementFromArgument3->setSynthesis($synthesis)->shouldBeCalled();
        $em->persist($elementFromArgument3)->shouldBeCalled();

        $em->flush()->shouldBeCalled();

        $this->beConstructedWith($em);
        $this->createElementsFromConsultationStep($synthesis)->shouldReturn(true);
    }

    function it_can_tell_if_element_is_related_to_object(SynthesisElement $element, SynthesisElement $object)
    {
        // Related element (same class, same id)
        $object->getId()->willReturn(42)->shouldBeCalled();
        $element->getLinkedDataClass()->willReturn('Capco\AppBundle\Entity\Synthesis\SynthesisElement')->shouldBeCalled();
        $element->getLinkedDataId()->willReturn(42)->shouldBeCalled();
        $this->isElementRelated($object, $element)->shouldReturn(true);

        // Not related (different id)
        $object->getId()->willReturn(42)->shouldBeCalled();
        $element->getLinkedDataClass()->willReturn('Capco\AppBundle\Entity\Synthesis\SynthesisElement')->shouldBeCalled();
        $element->getLinkedDataId()->willReturn(51)->shouldBeCalled();
        $this->isElementRelated($object, $element)->shouldReturn(true);

        // Not related (different class)
        $object->getId()->willReturn(42)->shouldBeCalled();
        $element->getLinkedDataClass()->willReturn('Capco\AppBundle\Entity\Synthesis\Test')->shouldBeCalled();
        $element->getLinkedDataId()->willReturn(42)->shouldBeCalled();
        $this->isElementRelated($object, $element)->shouldReturn(true);

        // Not related (both different)
        $object->getId()->willReturn(42)->shouldBeCalled();
        $element->getLinkedDataClass()->willReturn('Capco\AppBundle\Entity\Synthesis\Test')->shouldBeCalled();
        $element->getLinkedDataId()->willReturn(51)->shouldBeCalled();
        $this->isElementRelated($object, $element)->shouldReturn(true);
    }

    function it_can_create_an_element_from_opinion(Opinion $opinion)
    {
        $opinion->getTitle()->willReturn('test')->shouldBeCalled();
        $opinion->getBody()->willReturn('blabla')->shouldBeCalled();
        $opinion->getId()->willReturn(42)->shouldBeCalled();

        $element = $this->createElementFromOpinion($opinion);
        $element->shouldBeAnInstanceOf('Capco\AppBundle\Entity\Synthesis\SynthesisElement');
        $element->getTitle()->shouldReturn('test');
        $element->getBody()->shouldReturn('blabla');
        $element->getLinkedDataId()->shouldReturn(42);
    }

    function it_can_create_an_element_from_argument(Argument $argument)
    {
        $argument->getBody()->willReturn('blabla')->shouldBeCalled();
        $argument->getId()->willReturn(42)->shouldBeCalled();

        $element = $this->createElementFromArgument($argument);
        $element->shouldBeAnInstanceOf('Capco\AppBundle\Entity\Synthesis\SynthesisElement');
        $element->getBody()->shouldReturn('blabla');
        $element->getLinkedDataId()->shouldReturn(42);
    }*/

}
